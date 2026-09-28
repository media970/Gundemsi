import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL || "file:./dev.db";

const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  { name: "Gündem", slug: "gundem" },
  { name: "Türkiye", slug: "turkiye" },
  { name: "Dünya", slug: "dunya" },
  { name: "Teknoloji", slug: "teknoloji" },
  { name: "Ekonomi", slug: "ekonomi" },
  { name: "Spor", slug: "spor" },
  { name: "Kültür & Yaşam", slug: "kultur-yasam" },
  { name: "Oyun", slug: "oyun" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
      },
      create: category,
    });
  }

  console.log("8 kategori başarıyla oluşturuldu.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });