import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { createOrder } from '../../controllers/order.controller';

type TxClient = Prisma.TransactionClient;

const tx: TxClient = {
    cart: {
        findUnique: vi.fn(),
    },
    address: {
        findFirst: vi.fn(),
        create: vi.fn(),
    },
    product: {
        updateMany: vi.fn(),
    },
    productVariant: {
        updateMany: vi.fn(),
    },
    order: {
        create: vi.fn(),
    },
    cartItem: {
        deleteMany: vi.fn(),
    },
    orderTracking: {
        create: vi.fn(),
    },
} as unknown as TxClient;

const buildRequest = (overrides: Partial<Record<'user' | 'body', unknown>> = {}) => {
    const req = {
        user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
        body: {
            shippingAddressId: 'addr-1',
            billingAddressId: 'addr-1',
            paymentMethod: 'CARD',
        },
        ...overrides,
    } as unknown as Request;
    return req;
};

const buildResponse = () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock, json: jsonMock } as unknown as Response;
    return { res, jsonMock, statusMock };
};

const next: NextFunction = vi.fn();

const decimal = (value: string) => new Prisma.Decimal(value);

const buildCart = (items: any[]) => ({
    id: 'cart-1',
    userId: 'user-1',
    items,
});

const productItem = (overrides: any = {}) => ({
    id: 'ci-1',
    cartId: 'cart-1',
    productId: 'p1',
    variantId: null,
    quantity: 2,
    product: { id: 'p1', name: 'Widget', price: decimal('19.99'), stockQty: 10 },
    variant: null,
    ...overrides,
});

describe('Order Controller - createOrder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (prisma.$transaction as any).mockImplementation(async (operation: (client: TxClient) => Promise<unknown>) =>
            operation(tx as TxClient)
        );
        tx.address.findFirst.mockResolvedValue({ id: 'addr-1' });
        tx.product.updateMany.mockResolvedValue({ count: 1 });
        tx.productVariant.updateMany.mockResolvedValue({ count: 1 });
        tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });
        tx.orderTracking.create.mockResolvedValue({});
    });

    it('creates an order atomically with serializable isolation', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([productItem()]));
        tx.order.create.mockResolvedValue({
            id: 'order-1',
            orderNumber: 'ORD-123',
            items: [],
        });

        const req = buildRequest();
        const { res, jsonMock, statusMock } = buildResponse();

        await createOrder(req, res, next);

        expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
        expect(tx.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                userId: 'user-1',
                subtotal: decimal('39.98'),
                tax: decimal('4.00'),
                shippingCost: decimal('9.99'),
                total: decimal('53.97'),
            }),
        }));
        expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
        expect(tx.orderTracking.create).toHaveBeenCalledTimes(2);
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('rejects empty cart without creating an order', async () => {
        tx.cart.findUnique.mockResolvedValue(null);

        const req = buildRequest();
        const { res, jsonMock } = buildResponse();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = (next as any).mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Cart is empty');
        expect(tx.order.create).not.toHaveBeenCalled();
        expect(tx.product.updateMany).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    it('rejects non-positive quantity', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([productItem({ quantity: 0 })]));

        const req = buildRequest();
        const { res } = buildResponse();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = (next as any).mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('Invalid quantity');
        expect(tx.product.updateMany).not.toHaveBeenCalled();
    });

    it('rejects variant that does not belong to the product', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([
            productItem({
                variantId: 'v1',
                variant: { id: 'v1', productId: 'other-product', name: 'Red', price: decimal('24.99'), stockQty: 5 },
            }),
        ]));

        const req = buildRequest();
        const { res } = buildResponse();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = (next as any).mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Variant does not belong to product');
        expect(tx.productVariant.updateMany).not.toHaveBeenCalled();
    });

    it('rejects when read stock is below requested quantity', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([productItem({ quantity: 5, product: { id: 'p1', name: 'Widget', price: decimal('19.99'), stockQty: 4 } })]));

        const req = buildRequest();
        const { res } = buildResponse();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = (next as any).mock.calls[0][0];
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('Insufficient stock');
        expect(tx.product.updateMany).not.toHaveBeenCalled();
        expect(tx.order.create).not.toHaveBeenCalled();
    });

    it('rejects when conditional stock decrement misses (variant)', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([
            productItem({
                variantId: 'v1',
                variant: { id: 'v1', productId: 'p1', name: 'Red', price: decimal('24.99'), stockQty: 5 },
            }),
        ]));
        tx.productVariant.updateMany.mockResolvedValue({ count: 0 });

        const req = buildRequest();
        const { res } = buildResponse();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = (next as any).mock.calls[0][0];
        expect(error.statusCode).toBe(409);
        expect(error.message).toContain('Insufficient stock');
        expect(tx.order.create).not.toHaveBeenCalled();
    });

    it('rejects inline address creation failure inside transaction', async () => {
        tx.cart.findUnique.mockResolvedValue(buildCart([productItem()]));
        tx.address.findFirst.mockResolvedValue({ id: 'addr-1' });
        tx.address.create.mockRejectedValue(new Error('address insert failed'));

        const req = buildRequest({
            body: {
                shippingAddress: {
                    type: 'SHIPPING',
                    fullName: 'Test User',
                    phone: '+1234567890',
                    street: '1 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    postalCode: '62704',
                    country: 'US',
                    isDefault: false,
                },
                billingAddressId: 'addr-1',
                paymentMethod: 'CARD',
            },
        });
        const { res } = buildResponse();

        await createOrder(req, res, next);

        expect(tx.address.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ userId: 'user-1' }),
        }));
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(tx.order.create).not.toHaveBeenCalled();
    });
});
