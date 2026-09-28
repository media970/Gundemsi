import type { MetadataRoute } from "next";
import prisma from "../lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      select: {
        slug: true,
      },
    }),

    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `/kategori/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `/haber/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: "/",
      changeFrequency: "hourly",
      priority: 1,
    },
    ...categoryUrls,
    ...articleUrls,
  ];
}