// prisma/seed.js
// Run with: npx prisma db seed

const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Seeding database...');

  // Create store config
  const storeConfig = await prisma.store_config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      whatsapp_number: '56992800153',
      greeting: 'Hola! Hay pan? <3',
      show_prices: true,
    },
  });
  console.log('✅ Store config created:', storeConfig);

  // Create categories
  const categories = await Promise.all([
    prisma.categories.upsert({
      where: { category: 'Pan Artesanal' },
      update: {},
      create: { category: 'Pan Artesanal' },
    }),
    prisma.categories.upsert({
      where: { category: 'Dulces' },
      update: {},
      create: { category: 'Dulces' },
    }),
    prisma.categories.upsert({
      where: { category: 'Especiales' },
      update: {},
      create: { category: 'Especiales' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Sample products with placeholder images
  const productsData = [
    {
      product: 'Pan de Masa Madre',
      ingredients: 'Harina, agua, sal, masa madre',
      price: 4500,
      weight: '500g',
      description: 'Pan artesanal con masa madre de 48 horas de fermentación',
      available: true,
      unit_type: 'unit',
      categoryName: 'Pan Artesanal',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    },
    {
      product: 'Baguette Clásica',
      ingredients: 'Harina, agua, sal, levadura',
      price: 2500,
      weight: '250g',
      description: 'Baguette crujiente estilo francés',
      available: true,
      unit_type: 'unit',
      categoryName: 'Pan Artesanal',
      imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400',
    },
    {
      product: 'Pan de Centeno',
      ingredients: 'Harina de centeno, harina de trigo, agua, sal, masa madre',
      price: 5000,
      weight: '600g',
      description: 'Pan rústico de centeno con semillas',
      available: true,
      unit_type: 'unit',
      categoryName: 'Pan Artesanal',
      imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
    },
    {
      product: 'Croissant de Mantequilla',
      ingredients: 'Harina, mantequilla, huevo, azúcar, levadura',
      price: 2000,
      weight: '80g',
      description: 'Croissant hojaldrado con mantequilla premium',
      available: true,
      unit_type: 'unit',
      categoryName: 'Dulces',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    },
    {
      product: 'Rol de Canela (Pack 6)',
      ingredients: 'Harina, mantequilla, canela, azúcar, glaseado',
      price: 8500,
      weight: '450g',
      description: 'Pack de 6 roles de canela con glaseado',
      available: true,
      unit_type: 'pack',
      pack_size: 6,
      categoryName: 'Dulces',
      imageUrl: 'https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=400',
    },
    {
      product: 'Pan de Chocolate',
      ingredients: 'Harina, cacao, chocolate, mantequilla, huevo',
      price: 3500,
      weight: '300g',
      description: 'Pan dulce con trozos de chocolate belga',
      available: true,
      unit_type: 'unit',
      categoryName: 'Dulces',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    },
    {
      product: 'Focaccia Mediterránea',
      ingredients: 'Harina, aceite de oliva, romero, aceitunas, tomates cherry',
      price: 6000,
      weight: '400g',
      description: 'Focaccia con aceite de oliva extra virgen y hierbas',
      available: true,
      unit_type: 'unit',
      categoryName: 'Especiales',
      imageUrl: 'https://images.unsplash.com/photo-1619535860434-cf0fb6965b1d?w=400',
    },
    {
      product: 'Pan de Nueces',
      ingredients: 'Harina integral, nueces, miel, masa madre',
      price: 5500,
      weight: '450g',
      description: 'Pan integral con nueces caramelizadas',
      available: true,
      unit_type: 'unit',
      categoryName: 'Especiales',
      imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
    },
    {
      product: 'Brioche',
      ingredients: 'Harina, mantequilla, huevo, azúcar, leche',
      price: 4000,
      weight: '350g',
      description: 'Brioche esponjoso estilo francés',
      available: false, // Out of stock for testing
      unit_type: 'unit',
      categoryName: 'Especiales',
      imageUrl: 'https://images.unsplash.com/photo-1620921568481-e86c5e091084?w=400',
    },
  ];

  for (const data of productsData) {
    const { categoryName, imageUrl, ...productData } = data;

    // Create product
    const product = await prisma.products.create({
      data: {
        ...productData,
        price: productData.price,
      },
    });

    // Add image
    await prisma.product_img.create({
      data: {
        id_product: product.id,
        url_img: imageUrl,
      },
    });

    // Link to category
    const category = categories.find((c) => c.category === categoryName);
    if (category) {
      await prisma.categories_products.create({
        data: {
          id_product: product.id,
          id_category: category.id,
        },
      });
    }

    console.log(`✅ Created product: ${product.product}`);
  }

  // ============================================
  // Admin Users
  // ============================================
  console.log('👤 Seeding admin users...');
  
  // Temporary passwords for first login (users must change these)
  const devTempPassword = await bcrypt.hash('dev2026!Temp', SALT_ROUNDS);
  const adminTempPassword = await bcrypt.hash('admin2026!Temp', SALT_ROUNDS);
  
  const devUser = await prisma.users.upsert({
    where: { username: 'dev' },
    update: {},
    create: {
      username: 'dev',
      role: 'developer',
      passwordHash: devTempPassword,
      tempPassword: 'dev2026!Temp', // Stored for reference, will be cleared after setup
      passwordSetupRequired: true
    }
  });
  
  const adminUser = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      role: 'admin',
      passwordHash: adminTempPassword,
      tempPassword: 'admin2026!Temp',
      passwordSetupRequired: true
    }
  });
  
  console.log('✅ Seeded admin users:', { 
    dev: { id: devUser.id, username: devUser.username, role: devUser.role, tempPassword: 'dev2026!Temp' },
    admin: { id: adminUser.id, username: adminUser.username, role: adminUser.role, tempPassword: 'admin2026!Temp' }
  });

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
