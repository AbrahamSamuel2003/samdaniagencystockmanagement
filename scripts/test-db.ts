import prisma from "../src/lib/db";

async function verifyConnection() {
  console.log("=== SUPABASE DATABASE CONNECTION VERIFICATION ===");
  console.log("Connecting to PostgreSQL at:", process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "Supabase");

  const start = Date.now();
  
  // 1. Test Queries
  const [brandsCount, productsCount, suppliersCount, shopsCount, transactionsCount] = await Promise.all([
    prisma.brand.count(),
    prisma.product.count(),
    prisma.supplier.count(),
    prisma.shop.count(),
    prisma.stockTransaction.count(),
  ]);

  const brands = await prisma.brand.findMany({
    select: { name: true, code: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    include: { brand: true },
    take: 5,
  });

  const latency = Date.now() - start;

  console.log("\nDATABASE STATUS: CONNECTED & SYNCHRONIZED");
  console.log(`Query Latency: ${latency}ms`);
  console.log("--------------------------------------------------");
  console.log(`Brands in DB:       ${brandsCount} (${brands.map((b) => b.name).join(", ")})`);
  console.log(`Products in DB:     ${productsCount}`);
  console.log(`Suppliers in DB:    ${suppliersCount}`);
  console.log(`Shops in DB:        ${shopsCount}`);
  console.log(`Ledger Audit Rows:  ${transactionsCount}`);
  console.log("--------------------------------------------------");
  console.log("Sample Product SKUs Loaded from Live Database:");
  products.forEach((p) => {
    console.log(`  - [${p.brand.name}] ${p.name} (${p.packageSize} ${p.packageUnit}) | Stock: ${p.currentStock} ${p.stockUnit}`);
  });
  console.log("==================================================");
}

verifyConnection()
  .catch((err) => {
    console.error("DATABASE CONNECTION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
