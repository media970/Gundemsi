import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

type ArticleBlockInput = {
  type: "TEXT" | "IMAGE";
  content: string;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        blocks: {
          orderBy: { order: "asc" },
        },
        sources: true,
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Haber bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("GET /api/admin/haberler/[id] error:", error);

    return NextResponse.json(
      { error: "Haber alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      title,
      description,
      categorySlug,
      coverImage,
      blocks,
      sources,
      tags,
      status,
    } = body as {
      title?: string;
      description?: string;
      categorySlug?: string;
      coverImage?: string;
      blocks?: ArticleBlockInput[];
      sources?: { name: string; url: string }[];
      tags?: string[];
      status?: "DRAFT" | "PUBLISHED";
    };

    if (
      !title?.trim() ||
      !description?.trim() ||
      !categorySlug ||
      !coverImage?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Başlık, açıklama, kategori ve haber kapağı zorunludur.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { error: "Haber içerik blokları gerekli." },
        { status: 400 }
      );
    }

    const validBlocks = blocks.filter(
      (block) =>
        (block.type === "TEXT" || block.type === "IMAGE") &&
        typeof block.content === "string" &&
        block.content.trim()
    );

    if (validBlocks.length === 0) {
      return NextResponse.json(
        { error: "En az bir dolu içerik bloğu eklemelisin." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 400 }
      );
    }

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Haber bulunamadı." },
        { status: 404 }
      );
    }

    const nextStatus = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    const legacyContent = validBlocks
      .filter((block) => block.type === "TEXT")
      .map((block) => block.content.trim())
      .join("\n\n");

    const sourceData = Array.isArray(sources)
      ? sources
          .filter(
            (source) =>
              source &&
              typeof source.name === "string" &&
              typeof source.url === "string" &&
              source.name.trim() &&
              source.url.trim()
          )
          .map((source) => ({
            name: source.name.trim(),
            url: source.url.trim(),
          }))
      : [];

    const tagNames = Array.isArray(tags)
      ? tags
          .filter(
            (tag): tag is string =>
              typeof tag === "string" && tag.trim().length > 0
          )
          .map((tag) => tag.trim())
      : [];

    const updatedArticle = await prisma.$transaction(async (tx) => {
      // Eski blokları temizle.
      await tx.articleBlock.deleteMany({
        where: { articleId: id },
      });

      const updated = await tx.article.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description.trim(),
          content: legacyContent,
          comment: null,
          coverImage: coverImage.trim(),
          status: nextStatus,
          publishedAt:
            nextStatus === "PUBLISHED"
              ? existingArticle.publishedAt ?? new Date()
              : null,
          category: {
            connect: { id: category.id },
          },
          blocks: {
            create: validBlocks.map((block, index) => ({
              type: block.type,
              content: block.content.trim(),
              order: index,
            })),
          },
          sources: {
            deleteMany: {},
            create: sourceData,
          },
          tags: {
            set: [],
            connectOrCreate: tagNames.map((name) => {
              const tagSlug = createSlug(name);

              return {
                where: { slug: tagSlug },
                create: {
                  name,
                  slug: tagSlug,
                },
              };
            }),
          },
        },
        include: {
          category: true,
          blocks: {
            orderBy: { order: "asc" },
          },
          sources: true,
          tags: true,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
    });
  } catch (error) {
    console.error("PUT /api/admin/haberler/[id] error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Haber güncellenirken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}
