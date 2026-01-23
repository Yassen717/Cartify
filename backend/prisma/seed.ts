import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    let customer: { id: string; email: string } | null = null;

    // Only create test users in development
    if (process.env.NODE_ENV !== 'production') {
        // Generate secure random passwords
        const crypto = await import('crypto');
        const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
        const customerPassword = process.env.CUSTOMER_PASSWORD || crypto.randomBytes(16).toString('hex');

        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.upsert({
            where: { email: 'admin@cartify.com' },
            update: {},
            create: {
                email: 'admin@cartify.com',
                passwordHash: adminPasswordHash,
                firstName: 'Admin',
                lastName: 'User',
                phone: '+1234567890',
                role: 'ADMIN',
            },
        });
        console.log('✅ Created admin user:', admin.email);
        console.log('⚠️  Admin Password:', adminPassword);
        console.log('⚠️  SAVE THIS PASSWORD - It will not be shown again!');

        const customerPasswordHash = await bcrypt.hash(customerPassword, 10);
        customer = await prisma.user.upsert({
            where: { email: 'customer@example.com' },
            update: {},
            create: {
                email: 'customer@example.com',
                passwordHash: customerPasswordHash,
                firstName: 'John',
                lastName: 'Doe',
                phone: '+0987654321',
                role: 'CUSTOMER',
            },
        });
        console.log('✅ Created customer user:', customer.email);
        console.log('⚠️  Customer Password:', customerPassword);
        console.log('⚠️  SAVE THIS PASSWORD - It will not be shown again!');
    } else {
        console.log('⚠️  Skipping test user creation in production');
        console.log('⚠️  Create admin users manually with strong passwords');
        // Try to find existing customer for reviews
        customer = await prisma.user.findFirst({
            where: { role: 'CUSTOMER' },
        });
    }

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

    const homeKitchen = await prisma.category.upsert({
        where: { slug: 'home-kitchen' },
        update: {},
        create: {
            name: 'Home & Kitchen',
            slug: 'home-kitchen',
            description: 'Home and kitchen products',
            imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
        },
    });

    const cameras = await prisma.category.upsert({
        where: { slug: 'cameras' },
        update: {},
        create: {
            name: 'Cameras',
            slug: 'cameras',
            description: 'Photography equipment and cameras',
            imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a',
            parentId: electronics.id,
        },
    });

    const peripherals = await prisma.category.upsert({
        where: { slug: 'peripherals' },
        update: {},
        create: {
            name: 'Peripherals',
            slug: 'peripherals',
            description: 'Computer peripherals and accessories',
            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
            parentId: electronics.id,
        },
    });

    console.log('✅ Created categories');

    // Delete all existing products and related data first
    // This ensures we start fresh with only the 6 products we want
    // Order matters due to foreign key constraints
    console.log('🗑️  Cleaning up existing products...');
    await prisma.reviewVote.deleteMany({});
    await prisma.reviewImage.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.returnItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.productAttribute.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    console.log('✅ Cleaned up existing products');

    // Create sample products
    // Product 1 - Retro-Classic 40mm Film Camera (product-1.webp)
    const product1 = await prisma.product.upsert({
        where: { sku: 'CAM-FILM-40MM' },
        update: {},
        create: {
            name: 'Retro-Classic 40mm Film Camera',
            slug: 'retro-classic-40mm-film-camera',
            description:
                'Capture life in its most authentic form. This compact point-and-shoot merges vintage soul with modern reliability, featuring a sharp 40mm fixed lens. Perfect for street photography and preserving memories with that unmistakable film grain.',
            price: 299.99,
            comparePrice: 349.99,
            stockQty: 45,
            sku: 'CAM-FILM-40MM',
            brand: 'VintageCam',
            categoryId: cameras.id,
        },
    });

    // Delete existing images for product1 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product1.id },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product1.id,
                url: '/product-1.webp',
                altText: 'Retro-Classic 40mm Film Camera',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    // Product 2 - Prism Pro 16" Laptop (product-2.webp)
    const product2 = await prisma.product.upsert({
        where: { sku: 'LAPTOP-PRISM-PRO16' },
        update: {},
        create: {
            name: 'Prism Pro 16" Laptop',
            slug: 'prism-pro-16-laptop',
            description:
                'Power meets brilliance. With its edge-to-edge vibrant display and customizable backlit keyboard, the Prism Pro is designed for creators who work late into the night. Experience lightning-fast performance housed in a sleek, obsidian-black chassis.',
            price: 2499.99,
            comparePrice: 2799.99,
            stockQty: 35,
            sku: 'LAPTOP-PRISM-PRO16',
            brand: 'PrismTech',
            categoryId: laptops.id,
        },
    });

    // Delete existing images for product2 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product2.id },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product2.id,
                url: '/product-2.webp',
                altText: 'Prism Pro 16" Laptop',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    // Product 3 - Duo-Tone Smartphone Series (product-3.webp)
    const product3 = await prisma.product.upsert({
        where: { sku: 'PHONE-DUO-TONE' },
        update: {},
        create: {
            name: 'Duo-Tone Smartphone Series (Pixel & Apex)',
            slug: 'duo-tone-smartphone-series',
            description:
                'Why choose between power and elegance? Our latest flagship smartphones offer industry-leading triple-lens camera systems and seamless AI integration. Whether you prefer the minimalist white finish or the bold matte black, stay connected with the best in mobile innovation.',
            price: 999.99,
            comparePrice: 1199.99,
            stockQty: 60,
            sku: 'PHONE-DUO-TONE',
            brand: 'TechBrand',
            categoryId: smartphones.id,
        },
    });

    // Delete existing images for product3 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product3.id },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: product3.id,
                url: '/product-3.webp',
                altText: 'Duo-Tone Smartphone Series - Pixel & Apex',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    // Product 4 - Horizon Ultrawide Workstation (product-4.webp)
    const product4 = await prisma.product.upsert({
        where: { sku: 'LAPTOP-HORIZON-UW' },
        update: {},
        create: {
            name: 'Horizon Ultrawide Workstation',
            slug: 'horizon-ultrawide-workstation',
            description:
                'Expand your vision. The Horizon laptop features a stunning wide-gamut display that brings your projects to life with cinematic color. Designed for multi-taskers and visual artists who refuse to be boxed in by standard screen ratios.',
            price: 2799.99,
            comparePrice: 3199.99,
            stockQty: 25,
            sku: 'LAPTOP-HORIZON-UW',
            brand: 'HorizonTech',
            categoryId: laptops.id,
        },
    });
    console.log('✅ Created/Updated product 4:', product4.name);

    // Delete existing images for product4 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product4.id },
    });
    
    await prisma.productImage.createMany({
        data: [
            {
                productId: product4.id,
                url: '/product-4.webp',
                altText: 'Horizon Ultrawide Workstation',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    // Product 5 - Keychron K2 Mechanical Keyboard (product-5.webp)
    const product5 = await prisma.product.upsert({
        where: { sku: 'PERIPH-KB-K2' },
        update: {},
        create: {
            name: 'Keychron K2 Mechanical Keyboard',
            slug: 'keychron-k2-mechanical-keyboard',
            description:
                'Tactile, compact, and unmistakably stylish. This 75% layout mechanical keyboard features durable grey-scale keycaps with signature orange accents. Wireless connectivity and satisfying switch feedback make it the ultimate tool for both coders and writers.',
            price: 89.99,
            comparePrice: 119.99,
            stockQty: 90,
            sku: 'PERIPH-KB-K2',
            brand: 'Keychron',
            categoryId: peripherals.id,
        },
    });
    console.log('✅ Created/Updated product 5:', product5.name);

    // Delete existing images for product5 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product5.id },
    });
    
    await prisma.productImage.createMany({
        data: [
            {
                productId: product5.id,
                url: '/product-5.webp',
                altText: 'Keychron K2 Mechanical Keyboard',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    // Product 6 - Artisan Ceramic Latte Set (product-6.webp)
    const product6 = await prisma.product.upsert({
        where: { sku: 'HOME-LATTE-SET' },
        update: {},
        create: {
            name: 'Artisan Ceramic Latte Set',
            slug: 'artisan-ceramic-latte-set',
            description:
                'Slow down and savor the moment. This hand-glazed mint green ceramic cup and saucer set is designed to keep your brew at the perfect temperature. A beautiful addition to any morning routine or workspace desk.',
            price: 34.99,
            comparePrice: 49.99,
            stockQty: 85,
            sku: 'HOME-LATTE-SET',
            brand: 'ArtisanHome',
            categoryId: homeKitchen.id,
        },
    });
    console.log('✅ Created/Updated product 6:', product6.name);

    // Delete existing images for product6 if any, then create new ones
    await prisma.productImage.deleteMany({
        where: { productId: product6.id },
    });
    
    await prisma.productImage.createMany({
        data: [
            {
                productId: product6.id,
                url: '/product-6.webp',
                altText: 'Artisan Ceramic Latte Set',
                position: 1,
                isPrimary: true,
            },
        ],
    });

    console.log('✅ Created sample products');

    // Create some reviews (only if customer exists)
    if (customer) {
        await prisma.review.create({
            data: {
                productId: product1.id,
                userId: customer.id,
                rating: 5,
                title: 'Amazing vintage camera!',
                comment:
                    'This film camera captures the most beautiful moments with that classic film grain. The 40mm lens is sharp and perfect for street photography. Highly recommend for photography enthusiasts!',
                verifiedPurchase: true,
                helpfulCount: 15,
            },
        });

        await prisma.review.create({
            data: {
                productId: product2.id,
                userId: customer.id,
                rating: 5,
                title: 'Perfect for creators',
                comment:
                    'The Prism Pro is a beast! The display is stunning and the backlit keyboard is perfect for late-night work sessions. Performance is lightning-fast. Worth every penny!',
                verifiedPurchase: true,
                helpfulCount: 22,
            },
        });

        await prisma.review.create({
            data: {
                productId: product3.id,
                userId: customer.id,
                rating: 5,
                title: 'Best smartphone I\'ve owned',
                comment:
                    'The camera system is incredible and the AI features are seamless. I got the white version and it looks absolutely stunning. The build quality is top-notch!',
                verifiedPurchase: true,
                helpfulCount: 18,
            },
        });

        await prisma.review.create({
            data: {
                productId: product5.id,
                userId: customer.id,
                rating: 5,
                title: 'Best keyboard for coding',
                comment:
                    'The tactile feedback is amazing and the compact layout is perfect for my desk. The orange accents add a nice touch. Wireless connectivity works flawlessly!',
                verifiedPurchase: true,
                helpfulCount: 12,
            },
        });

        await prisma.review.create({
            data: {
                productId: product6.id,
                userId: customer.id,
                rating: 5,
                title: 'Beautiful and functional',
                comment:
                    'The mint green color is gorgeous and the ceramic keeps my coffee at the perfect temperature. It\'s become an essential part of my morning routine. Highly recommend!',
                verifiedPurchase: true,
                helpfulCount: 9,
            },
        });
        console.log('✅ Created sample reviews');
    } else {
        console.log('⚠️  Skipping reviews creation - no customer user found');
    }

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
