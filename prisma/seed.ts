import { seedRoyalGulmargMenu } from "../src/lib/seed-data";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🏔️ Seeding Gulmarg Cloud Kitchen database...");
  const result = await seedRoyalGulmargMenu();
  console.log("✅", result.message);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
