import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cartify.com' },
        update: {},
        create: {
            email: 'admin@cartify.com',
            passwordHash: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1234567890',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            passwordHash: customerPassword,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+0987654321',
            role: 'CUSTOMER',
        },
    });
    console.log('✅ Created customer user:', customer.email);

    // Create categories
    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices and accessories',
            imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        },
    });

    const smartphones = await prisma.category.upsert({
        where: { slug: 'smartphones' },
        update: {},
        create: {
            name: 'Smartphones',
            slug: 'smartphones',
            description: 'Latest smartphones and mobile devices',
            imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
            parentId: electronics.id,
        },
    });

    const laptops = await prisma.category.upsert({
        where: { slug: 'laptops' },
        update: {},
        create: {
            name: 'Laptops',
            slug: 'laptops',
            description: 'Laptops and notebooks',
            imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
            parentId: electronics.id,
        },
    });

    const clothing = await prisma.category.upsert({
        where: { slug: 'clothing' },
        update: {},
        create: {
            name: 'Clothing',
            slug: 'clothing',
            description: 'Fashion and apparel',
            imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
        },
    });

    const mensWear = await prisma.category.upsert({
        where: { slug: 'mens-wear' },
        update: {},
        create: {
            name: "Men's Wear",
            slug: 'mens-wear',
            description: 'Clothing for men',
            imageUrl: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891',
            parentId: clothing.id,
        },
    });

    console.log('✅ Created categories');

    // Create sample products
    const product1 = await prisma.product.upsert({
        where: { sku: 'PHONE-IP15-256' },
        update: {},
        create: {
            name: 'Premium Smartphone Pro',
            slug: 'premium-smartphone-pro',
            description:
                'Experience the future with our latest flagship smartphone. Features a stunning 6.7-inch OLED display, powerful processor, and advanced camera system.',
            price: 999.99,
            comparePrice: 1199.99,
            stockQty: 50,
            sku: 'PHONE-IP15-256',
            brand: 'TechBrand',
            categoryId: smartphones.id,
        },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product1.id,
                url: 'https://images.unsplash.com/photo-1592286927505-2fd3d9e95838',
                altText: 'Premium Smartphone Pro - Front View',
                position: 1,
                isPrimary: true,
            },
            {
                productId: product1.id,
                url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97',
                altText: 'Premium Smartphone Pro - Back View',
                position: 2,
                isPrimary: false,
            },
        ],
    });

    const product2 = await prisma.product.upsert({
        where: { sku: 'LAPTOP-MB-PRO16' },
        update: {},
        create: {
            name: 'UltraBook Pro 16',
            slug: 'ultrabook-pro-16',
            description:
                'Powerful laptop for professionals. 16-inch Retina display, M2 chip, 16GB RAM, 512GB SSD. Perfect for creative work and development.',
            price: 2499.99,
            comparePrice: 2799.99,
            stockQty: 30,
            sku: 'LAPTOP-MB-PRO16',
            brand: 'TechBrand',
            categoryId: laptops.id,
        },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product2.id,
                url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
                altText: 'UltraBook Pro 16 - Main View',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    const product3 = await prisma.product.upsert({
        where: { sku: 'CLOTH-SHIRT-001' },
        update: {},
        create: {
            name: 'Classic Cotton Shirt',
            slug: 'classic-cotton-shirt',
            description:
                'Premium 100% cotton shirt with modern fit. Available in multiple colors and sizes. Perfect for both casual and formal occasions.',
            price: 49.99,
            comparePrice: 79.99,
            stockQty: 100,
            sku: 'CLOTH-SHIRT-001',
            brand: 'FashionCo',
            categoryId: mensWear.id,
        },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product3.id,
                url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
                altText: 'Classic Cotton Shirt - Blue',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    console.log('✅ Created sample products');

    // Create product variants for the shirt
    await prisma.productVariant.createMany({
        data: [
            {
                productId: product3.id,
                name: 'Blue - Small',
                sku: 'CLOTH-SHIRT-001-BL-S',
                price: 49.99,
                stockQty: 20,
                attributes: { color: 'Blue', size: 'S' },
            },
            {
                productId: product3.id,
                name: 'Blue - Medium',
                sku: 'CLOTH-SHIRT-001-BL-M',
                price: 49.99,
                stockQty: 25,
                attributes: { color: 'Blue', size: 'M' },
            },
            {
                productId: product3.id,
                name: 'Blue - Large',
                sku: 'CLOTH-SHIRT-001-BL-L',
                price: 49.99,
                stockQty: 30,
                attributes: { color: 'Blue', size: 'L' },
            },
            {
                productId: product3.id,
                name: 'White - Medium',
                sku: 'CLOTH-SHIRT-001-WH-M',
                price: 49.99,
                stockQty: 25,
                attributes: { color: 'White', size: 'M' },
            },
        ],
    });

    console.log('✅ Created product variants');

    // Create some reviews
    await prisma.review.create({
        data: {
            productId: product1.id,
            userId: customer.id,
            rating: 5,
            title: 'Amazing phone!',
            comment:
                'This phone exceeded my expectations. The camera quality is outstanding and the battery life is incredible. Highly recommend!',
            verifiedPurchase: true,
            helpfulCount: 12,
        },
    });

    await prisma.review.create({
        data: {
            productId: product2.id,
            userId: customer.id,
            rating: 4,
            title: 'Great laptop for work',
            comment:
                'Excellent performance for development work. The screen is beautiful and the build quality is top-notch. Only minor complaint is the price.',
            verifiedPurchase: true,
            helpfulCount: 8,
        },
    });

    console.log('✅ Created sample reviews');

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
