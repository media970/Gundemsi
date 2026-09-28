import "dotenv/config";
import Database from "better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

type SqliteRow = Record<string, unknown>;

const sqlite = new Database("./dev.db", {
  readonly: true,
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function getRows(table: string): SqliteRow[] {
  return sqlite.prepare(`SELECT * FROM "${table}"`).all() as SqliteRow[];
}

function getRequiredString(
  row: SqliteRow,
  field: string
): string {
  const value = row[field];

  if (typeof value !== "string") {
    throw new Error(`${tableName}: ${field} string değil.`);
  }

  return value;
}

let tableName = "";

async function main() {
  console.log("SQLite → PostgreSQL aktarımı başlıyor...\n");

  /*
   * 1. CATEGORY
   */
  tableName = "Category";

  const categories = getRows(tableName);

  for (const row of categories) {
    await prisma.category.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        name: getRequiredString(row, "name"),
        slug: getRequiredString(row, "slug"),
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        name: getRequiredString(row, "name"),
        slug: getRequiredString(row, "slug"),
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
      },
    });
  }

  console.log(`✓ Category: ${categories.length}`);

  /*
   * 2. TAG
   */
  tableName = "Tag";

  const tags = getRows(tableName);

  for (const row of tags) {
    await prisma.tag.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        name: getRequiredString(row, "name"),
        slug: getRequiredString(row, "slug"),
        createdAt: new Date(row.createdAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        name: getRequiredString(row, "name"),
        slug: getRequiredString(row, "slug"),
        createdAt: new Date(row.createdAt as string),
      },
    });
  }

  console.log(`✓ Tag: ${tags.length}`);

  /*
   * 3. ARTICLE
   */
  tableName = "Article";

  const articles = getRows(tableName);

  for (const row of articles) {
    const articleId = getRequiredString(row, "id");
    const categoryId = getRequiredString(row, "categoryId");

    await prisma.article.upsert({
      where: {
        id: articleId,
      },
      update: {
        title: getRequiredString(row, "title"),
        slug: getRequiredString(row, "slug"),
        description: getRequiredString(row, "description"),
        content: getRequiredString(row, "content"),
        coverImage:
          typeof row.coverImage === "string"
            ? row.coverImage
            : null,
        comment:
          typeof row.comment === "string"
            ? row.comment
            : null,
        status: getRequiredString(row, "status"),
        isFeatured: Boolean(row.isFeatured),
        publishedAt:
          row.publishedAt
            ? new Date(row.publishedAt as string)
            : null,
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
      create: {
        id: articleId,
        title: getRequiredString(row, "title"),
        slug: getRequiredString(row, "slug"),
        description: getRequiredString(row, "description"),
        content: getRequiredString(row, "content"),
        coverImage:
          typeof row.coverImage === "string"
            ? row.coverImage
            : null,
        comment:
          typeof row.comment === "string"
            ? row.comment
            : null,
        status: getRequiredString(row, "status"),
        isFeatured: Boolean(row.isFeatured),
        publishedAt:
          row.publishedAt
            ? new Date(row.publishedAt as string)
            : null,
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  console.log(`✓ Article: ${articles.length}`);

  /*
   * 4. SOURCE
   */
  tableName = "Source";

  const sources = getRows(tableName);

  for (const row of sources) {
    await prisma.source.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        name: getRequiredString(row, "name"),
        url: getRequiredString(row, "url"),
        articleId: getRequiredString(row, "articleId"),
        createdAt: new Date(row.createdAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        name: getRequiredString(row, "name"),
        url: getRequiredString(row, "url"),
        articleId: getRequiredString(row, "articleId"),
        createdAt: new Date(row.createdAt as string),
      },
    });
  }

  console.log(`✓ Source: ${sources.length}`);

  /*
   * 5. ARTICLE BLOCK
   */
  tableName = "ArticleBlock";

  const blocks = getRows(tableName);

  for (const row of blocks) {
    await prisma.articleBlock.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        type: getRequiredString(row, "type"),
        content: getRequiredString(row, "content"),
        order: Number(row.order),
        articleId: getRequiredString(row, "articleId"),
        createdAt: new Date(row.createdAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        type: getRequiredString(row, "type"),
        content: getRequiredString(row, "content"),
        order: Number(row.order),
        articleId: getRequiredString(row, "articleId"),
        createdAt: new Date(row.createdAt as string),
      },
    });
  }

  console.log(`✓ ArticleBlock: ${blocks.length}`);

  /*
   * 6. ARTICLE ↔ TAG
   *
   * Prisma'nın implicit many-to-many ilişkisini
   * mevcut Tag kayıtlarına göre kuruyoruz.
   */
  const articleTagRows = getRows("_ArticleToTag");

  const articleTagMap = new Map<string, string[]>();

  for (const row of articleTagRows) {
    const articleId = getRequiredString(row, "A");
    const tagId = getRequiredString(row, "B");

    const current = articleTagMap.get(articleId) ?? [];
    current.push(tagId);
    articleTagMap.set(articleId, current);
  }

  for (const [articleId, tagIds] of articleTagMap) {
    await prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        tags: {
          set: tagIds.map((id) => ({
            id,
          })),
        },
      },
    });
  }

  console.log(`✓ Article ↔ Tag ilişkileri: ${articleTagRows.length}`);

  /*
   * 7. SITE SETTINGS
   */
  tableName = "SiteSetting";

  const siteSettings = getRows(tableName);

  for (const row of siteSettings) {
    await prisma.siteSetting.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        key: getRequiredString(row, "key"),
        value: getRequiredString(row, "value"),
        updatedAt: new Date(row.updatedAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        key: getRequiredString(row, "key"),
        value: getRequiredString(row, "value"),
        updatedAt: new Date(row.updatedAt as string),
      },
    });
  }

  console.log(`✓ SiteSetting: ${siteSettings.length}`);

  /*
   * 8. ADMIN
   */
  tableName = "Admin";

  const admins = getRows(tableName);

  for (const row of admins) {
    await prisma.admin.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        username: getRequiredString(row, "username"),
        passwordHash: getRequiredString(row, "passwordHash"),
        sessionVersion: Number(row.sessionVersion),
        totpSecret:
          typeof row.totpSecret === "string"
            ? row.totpSecret
            : null,
        totpEnabled: Boolean(row.totpEnabled),
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        username: getRequiredString(row, "username"),
        passwordHash: getRequiredString(row, "passwordHash"),
        sessionVersion: Number(row.sessionVersion),
        totpSecret:
          typeof row.totpSecret === "string"
            ? row.totpSecret
            : null,
        totpEnabled: Boolean(row.totpEnabled),
        createdAt: new Date(row.createdAt as string),
        updatedAt: new Date(row.updatedAt as string),
      },
    });
  }

  console.log(`✓ Admin: ${admins.length}`);

  /*
   * 9. ADMIN RECOVERY CODES
   */
  tableName = "AdminRecoveryCode";

  const recoveryCodes = getRows(tableName);

  for (const row of recoveryCodes) {
    await prisma.adminRecoveryCode.upsert({
      where: {
        id: getRequiredString(row, "id"),
      },
      update: {
        adminId: getRequiredString(row, "adminId"),
        codeHash: getRequiredString(row, "codeHash"),
        usedAt:
          row.usedAt
            ? new Date(row.usedAt as string)
            : null,
        createdAt: new Date(row.createdAt as string),
      },
      create: {
        id: getRequiredString(row, "id"),
        adminId: getRequiredString(row, "adminId"),
        codeHash: getRequiredString(row, "codeHash"),
        usedAt:
          row.usedAt
            ? new Date(row.usedAt as string)
            : null,
        createdAt: new Date(row.createdAt as string),
      },
    });
  }

  console.log(`✓ AdminRecoveryCode: ${recoveryCodes.length}`);

  console.log("\n=================================");
  console.log("SQLite → PostgreSQL aktarımı tamamlandı.");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("\nAKTARIM HATASI:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });