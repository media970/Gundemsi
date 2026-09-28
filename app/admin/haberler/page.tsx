import prisma from "../../../lib/prisma";
import AdminNewsClient from "./AdminNewsClient";

export default async function AdminNewsPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  const serializedArticles = articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    status: article.status,
    createdAt: article.createdAt.toISOString(),
    coverImage: article.coverImage,
    isFeatured: article.isFeatured,
    category: {
      name: article.category.name,
    },
  }));

  return <AdminNewsClient articles={serializedArticles} />;
}