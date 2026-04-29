import mongoose from "mongoose";

// Use same pattern as seed.ts
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/patjebzy";

async function fixProfit() {
  console.log("🛠  Starting profit data repair...");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db!;
    
    // Use raw collections to avoid model conflicts
    const salesCol = db.collection("sales");
    const productsCol = db.collection("products");

    // Find all sales that don't have totalProfit
    const sales = await salesCol.find({ totalProfit: { $exists: false } }).toArray();
    console.log(`📊 Found ${sales.length} legacy sales to update.`);

    if (sales.length === 0) {
      console.log("✨ No legacy sales found. Everything is up to date!");
      process.exit(0);
    }

    let updatedCount = 0;

    for (const sale of sales) {
      let totalProfit = 0;
      const updatedItems = [];

      for (const item of (sale.items || [])) {
        // Find product to get cost price
        const product = await productsCol.findOne({ _id: item.product });
        
        // If product found, use its costPrice. Otherwise estimate 70% cost.
        const unitCost = product?.costPrice || (item.unitPrice * 0.7);
        const itemProfit = (item.unitPrice - unitCost) * item.quantity;
        
        updatedItems.push({
          ...item,
          unitCost,
          totalProfit: itemProfit
        });

        totalProfit += itemProfit;
      }

      await salesCol.updateOne(
        { _id: sale._id },
        { 
          $set: { 
            totalProfit,
            items: updatedItems
          } 
        }
      );
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} sales with profit data.`);
  } catch (error) {
    console.error("❌ Repair failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected.");
    process.exit(0);
  }
}

fixProfit();
