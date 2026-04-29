import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Direct MongoDB connection for the seed script (runs outside Next.js)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/patjebzy";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db!;

  // ── Clear existing data ──
  const collections = ["users", "categories", "products", "sales"];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
      console.log(`  🗑  Dropped collection: ${col}`);
    } catch {
      // Collection may not exist yet
    }
  }
  console.log("");

  // ── Seed Admin User ──
  const salt = await bcrypt.genSalt(12);
  const adminPassword = await bcrypt.hash("Admin@1234", salt);
  const repPassword = await bcrypt.hash("Rep@1234", salt);

  const users = await db.collection("users").insertMany([
    {
      name: "Admin User",
      email: "admin@patjebzy.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
      phone: "08012345678",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "John Sales",
      email: "john@patjebzy.com",
      password: repPassword,
      role: "sales_rep",
      isActive: true,
      phone: "08098765432",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("✅ Created users:");
  console.log("   📧 admin@patjebzy.com / Admin@1234 (Admin)");
  console.log("   📧 john@patjebzy.com / Rep@1234 (Sales Rep)\n");

  // ── Seed Categories ──
  const categoryData = [
    { name: "Electronics", prefix: "ELC", description: "Electronic devices and gadgets" },
    { name: "Clothing", prefix: "CLT", description: "Apparel and fashion items" },
    { name: "Food & Beverages", prefix: "FNB", description: "Food items and drinks" },
    { name: "Home & Living", prefix: "HML", description: "Home decor and furniture" },
    { name: "Beauty & Health", prefix: "BNH", description: "Beauty and healthcare products" },
  ];

  const categories = await db.collection("categories").insertMany(
    categoryData.map((c) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  console.log(`✅ Created ${categoryData.length} categories\n`);

  const catIds = Object.values(categories.insertedIds);

  // ── Seed Products ──
  const generateSKU = (prefix: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${suffix}`;
  };

  const productData = [
    { name: "iPhone 15 Pro Max", category: 0, costPrice: 750000, sellingPrice: 950000, quantity: 25, lowStockThreshold: 5, description: "Latest Apple flagship phone" },
    { name: "Samsung Galaxy S24 Ultra", category: 0, costPrice: 680000, sellingPrice: 850000, quantity: 18, lowStockThreshold: 5, description: "Premium Samsung smartphone" },
    { name: "AirPods Pro 2", category: 0, costPrice: 120000, sellingPrice: 165000, quantity: 40, lowStockThreshold: 10, description: "Wireless noise-cancelling earbuds" },
    { name: "MacBook Air M3", category: 0, costPrice: 850000, sellingPrice: 1100000, quantity: 8, lowStockThreshold: 3, description: "Lightweight Apple laptop" },
    { name: "Nike Air Max 90", category: 1, costPrice: 35000, sellingPrice: 55000, quantity: 30, lowStockThreshold: 8, description: "Classic Nike sneakers" },
    { name: "Polo Ralph Lauren Shirt", category: 1, costPrice: 28000, sellingPrice: 45000, quantity: 3, lowStockThreshold: 5, description: "Premium cotton polo shirt" },
    { name: "Coca Cola (Pack of 24)", category: 2, costPrice: 4800, sellingPrice: 7200, quantity: 50, lowStockThreshold: 15, description: "24-pack of Coca Cola cans" },
    { name: "Premium Green Tea (Box)", category: 2, costPrice: 3500, sellingPrice: 5500, quantity: 2, lowStockThreshold: 10, description: "Imported green tea bags" },
    { name: "LED Desk Lamp", category: 3, costPrice: 8500, sellingPrice: 15000, quantity: 20, lowStockThreshold: 5, description: "Adjustable LED desk lamp" },
    { name: "Vitamin C Serum", category: 4, costPrice: 12000, sellingPrice: 22000, quantity: 35, lowStockThreshold: 10, description: "Brightening face serum" },
  ];

  await db.collection("products").insertMany(
    productData.map((p) => ({
      name: p.name,
      sku: generateSKU(categoryData[p.category].prefix),
      description: p.description,
      category: catIds[p.category],
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  console.log(`✅ Created ${productData.length} products\n`);

  // ── Seed a few sample sales ──
  const repId = Object.values(users.insertedIds)[1];
  const productsList = await db.collection("products").find().toArray();

  const saleData = [
    {
      saleNumber: "SAL-00001",
      items: [
        {
          product: productsList[0]._id,
          productName: productsList[0].name,
          quantity: 1,
          unitPrice: productsList[0].sellingPrice,
          totalPrice: productsList[0].sellingPrice,
        },
        {
          product: productsList[2]._id,
          productName: productsList[2].name,
          quantity: 2,
          unitPrice: productsList[2].sellingPrice,
          totalPrice: (productsList[2].sellingPrice as number) * 2,
        },
      ],
      totalAmount: (productsList[0].sellingPrice as number) + (productsList[2].sellingPrice as number) * 2,
      customerName: "Chidi Okonkwo",
      customerPhone: "08033445566",
      soldBy: repId,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      saleNumber: "SAL-00002",
      items: [
        {
          product: productsList[4]._id,
          productName: productsList[4].name,
          quantity: 2,
          unitPrice: productsList[4].sellingPrice,
          totalPrice: (productsList[4].sellingPrice as number) * 2,
        },
      ],
      totalAmount: (productsList[4].sellingPrice as number) * 2,
      customerName: "Aisha Ibrahim",
      soldBy: repId,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      saleNumber: "SAL-00003",
      items: [
        {
          product: productsList[9]._id,
          productName: productsList[9].name,
          quantity: 3,
          unitPrice: productsList[9].sellingPrice,
          totalPrice: (productsList[9].sellingPrice as number) * 3,
        },
        {
          product: productsList[6]._id,
          productName: productsList[6].name,
          quantity: 5,
          unitPrice: productsList[6].sellingPrice,
          totalPrice: (productsList[6].sellingPrice as number) * 5,
        },
      ],
      totalAmount: (productsList[9].sellingPrice as number) * 3 + (productsList[6].sellingPrice as number) * 5,
      customerName: "Tunde Bakare",
      customerPhone: "07011223344",
      soldBy: repId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("sales").insertMany(saleData);
  console.log(`✅ Created ${saleData.length} sample sales\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Database seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
