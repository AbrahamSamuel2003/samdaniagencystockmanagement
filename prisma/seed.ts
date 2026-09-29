import prisma from "../src/lib/db";

async function main() {
  console.log("Seeding Supabase database with default brands, suppliers, shops and products...");

  // 1. Seed Brands
  const aachi = await prisma.brand.upsert({
    where: { name: "Aachi" },
    update: {},
    create: { name: "Aachi", code: "ACH", status: "ACTIVE" },
  });

  const sun = await prisma.brand.upsert({
    where: { name: "Sun" },
    update: {},
    create: { name: "Sun", code: "SUN", status: "ACTIVE" },
  });

  const sakthi = await prisma.brand.upsert({
    where: { name: "Sakthi" },
    update: {},
    create: { name: "Sakthi", code: "SKT", status: "ACTIVE" },
  });

  const anjali = await prisma.brand.upsert({
    where: { name: "Anjali" },
    update: {},
    create: { name: "Anjali", code: "ANJ", status: "ACTIVE" },
  });

  const goldWinner = await prisma.brand.upsert({
    where: { name: "Gold Winner" },
    update: {},
    create: { name: "Gold Winner", code: "GWN", status: "ACTIVE" },
  });

  // 2. Seed Suppliers
  await prisma.supplier.upsert({
    where: { name: "ABC Traders" },
    update: {},
    create: {
      name: "ABC Traders",
      phone: "+91 98450 11223",
      address: "Wholesale Market, Sector 4",
      notes: "Primary spice distributor",
      status: "ACTIVE",
    },
  });

  await prisma.supplier.upsert({
    where: { name: "XYZ Distributors" },
    update: {},
    create: {
      name: "XYZ Distributors",
      phone: "+91 97890 44556",
      address: "Industrial Estate, Phase 2",
      notes: "Oil and ghee supplier",
      status: "ACTIVE",
    },
  });

  // 3. Seed Shops
  await prisma.shop.upsert({
    where: { name: "Sri Lakshmi Stores" },
    update: {},
    create: {
      name: "Sri Lakshmi Stores",
      contactPerson: "Ramasamy",
      phone: "+91 98765 43210",
      address: "14 Bazaar Street, Town",
      notes: "Daily evening dispatch route",
      status: "ACTIVE",
    },
  });

  await prisma.shop.upsert({
    where: { name: "ABC Supermarket" },
    update: {},
    create: {
      name: "ABC Supermarket",
      contactPerson: "Nagarajan",
      phone: "+91 98765 12345",
      address: "45 Bypass Road, Cross 2",
      notes: "Bulk weekly delivery on Mondays",
      status: "ACTIVE",
    },
  });

  // 4. Seed Products
  const products = [
    {
      brandId: aachi.id,
      name: "Turmeric Powder",
      packageSize: 100,
      packageUnit: "g",
      stockUnit: "kg",
      hasBoxConversion: false,
      openingStock: 25,
      currentStock: 25,
      lowStockLimit: 10,
    },
    {
      brandId: aachi.id,
      name: "Chilli Powder",
      packageSize: 100,
      packageUnit: "g",
      stockUnit: "pkt",
      hasBoxConversion: true,
      unitsPerBox: 20,
      subUnitName: "Packet",
      openingStock: 100,
      currentStock: 100,
      lowStockLimit: 30,
    },
    {
      brandId: aachi.id,
      name: "Chilli Powder",
      packageSize: 500,
      packageUnit: "g",
      stockUnit: "pkt",
      hasBoxConversion: true,
      unitsPerBox: 10,
      subUnitName: "Packet",
      openingStock: 50,
      currentStock: 4,
      lowStockLimit: 15,
    },
    {
      brandId: sun.id,
      name: "Sunflower Oil",
      packageSize: 1,
      packageUnit: "L",
      stockUnit: "box",
      hasBoxConversion: true,
      unitsPerBox: 12,
      subUnitName: "Bottle",
      openingStock: 20,
      currentStock: 20,
      lowStockLimit: 5,
    },
    {
      brandId: anjali.id,
      name: "Ghee",
      packageSize: 1,
      packageUnit: "kg",
      stockUnit: "kg",
      hasBoxConversion: false,
      openingStock: 15,
      currentStock: -2,
      lowStockLimit: 5,
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({
      where: {
        brandId: prod.brandId,
        name: prod.name,
        packageSize: prod.packageSize,
        packageUnit: prod.packageUnit,
      },
    });

    if (!existing) {
      await prisma.product.create({
        data: prod,
      });
    }
  }

  console.log("Supabase Database seeded successfully with initial products, brands, shops & suppliers!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
