import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";
import MobileCategoryMenu from "../../components/MobileCategoryMenu";
import ThemeToggle from "../../components/ThemeToggle";

const categories = [
  { name: "Gündem", slug: "gundem", color: "#8b5cf6" },
  { name: "Türkiye", slug: "turkiye", color: "#2563eb" },
  { name: "Dünya", slug: "dunya", color: "#0d9488" },
  { name: "Teknoloji", slug: "teknoloji", color: "#4f46e5" },
  { name: "Ekonomi", slug: "ekonomi", color: "#16a34a" },
  { name: "Spor", slug: "spor", color: "#ea580c" },
  { name: "Kültür & Yaşam", slug: "kultur-yasam", color: "#db2777" },
  { name: "Oyun", slug: "oyun", color: "#7c3aed" },
];

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
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
    notFound();
  }

  const categoryColor =
    categories.find((item) => item.slug === article.category.slug)?.color ??
    "#7c3aed";

  return (
    <>
      <style>{`
        .news-page {
          --page-bg: #f5f7fb;
          --surface: #ffffff;
          --surface-soft: #eef2f7;
          --text: #101828;
          --muted: #667085;
          --border: #e4e7ec;
        }

        html[data-theme="dark"] .news-page {
          --page-bg: #080b12;
          --surface: #111722;
          --surface-soft: #171e2b;
          --text: #f3f5f8;
          --muted: #98a2b3;
          --border: #263142;
        }

        .news-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--category-color) 10%, transparent), transparent 28rem),
            radial-gradient(circle at 92% 8%, rgba(37,99,235,.06), transparent 30rem),
            var(--page-bg);
          color: var(--text);
        }

        .news-surface {
          background: var(--surface);
          border-color: var(--border);
        }

        .news-muted {
          color: var(--muted);
        }

        .news-nav:hover {
          background: color-mix(in srgb, var(--category-color) 10%, var(--surface-soft));
          color: var(--category-color);
        }

        .news-home:hover {
          border-color: color-mix(in srgb, var(--category-color) 35%, var(--border)) !important;
          color: var(--category-color);
        }
.news-mobile-menu {
  flex-shrink: 0;
}

.news-mobile-menu summary {
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
}

@media (max-width: 639px) {
  .news-mobile-menu summary {
    padding-left: 10px;
    padding-right: 10px;
    gap: 6px;
    font-size: 13px;
  }
}

        .news-text {
          color: var(--text);
        }
      `}</style>

      <main
        className="news-page"
        style={{ ["--category-color" as string]: categoryColor }}
      >
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in srgb, var(--surface) 88%, transparent)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}, #2563eb)`,
                  }}
                >
                  G
                </div>
                <div>
                  <div className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
                    GÜNDEMSİ
                  </div>
                  <div className="news-muted -mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Gündeme değin.
                  </div>
                </div>
              </div>
            </Link>

            <nav className="ml-auto hidden items-center gap-1 lg:flex">
              {categories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/kategori/${item.slug}`}
                  className="news-nav rounded-xl px-3 py-2 text-sm font-semibold transition"
                  style={{ ["--category-color" as string]: item.color }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="news-home ml-auto flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition lg:ml-2"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
              aria-label="Ana Sayfa"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
              </svg>
              <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
<div className="news-mobile-menu lg:hidden">
  <MobileCategoryMenu categories={categories} />
</div>
            </div>
          </div>
        </header>

        <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2.5 sm:px-6 lg:px-8">
            <span className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Son Dakika
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <span className="news-muted truncate text-xs font-semibold sm:text-sm">
              GÜNDEMSİ&apos;de günün öne çıkan gelişmelerini takip et.
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={`/kategori/${article.category.slug}`}
              className="font-black transition"
              style={{ color: categoryColor }}
            >
              {article.category.name}
            </Link>
            <span className="news-muted">•</span>
            <time dateTime={article.createdAt.toISOString()} className="news-muted">
              {new Date(article.createdAt).toLocaleDateString("tr-TR")}
            </time>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          <p className="news-muted mt-6 max-w-3xl text-base leading-8 sm:text-xl">
            {article.description}
          </p>

          <div className="mt-10">
            {article.blocks.length > 0 ? (
              <div className="space-y-10">
                {article.blocks.map((block) =>
                  block.type === "IMAGE" ? (
                    <figure
                      key={block.id}
                      className="overflow-hidden rounded-[1.5rem] border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <img
                        src={block.content}
                        alt={article.title}
                        className="h-auto w-full object-contain"
                      />
                    </figure>
                  ) : (
                    <div
                      key={block.id}
                      className="news-text whitespace-pre-line text-base leading-8 sm:text-lg sm:leading-9"
                    >
                      {block.content}
                    </div>
                  )
                )}
              </div>
            ) : (
              <>
                {article.coverImage && (
                  <figure className="overflow-hidden rounded-[1.5rem] border" style={{ borderColor: "var(--border)" }}>
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="h-auto w-full object-contain"
                    />
                  </figure>
                )}

                {article.content && (
                  <article className="news-text mt-8 whitespace-pre-line text-base leading-8 sm:text-lg sm:leading-9">
                    {article.content}
                  </article>
                )}
              </>
            )}
          </div>

          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t pt-8" style={{ borderColor: "var(--border)" }}>
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    background: `color-mix(in srgb, ${categoryColor} 10%, var(--surface-soft))`,
                    color: categoryColor,
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {article.sources.length > 0 && (
            <section className="mt-12 border-t pt-8" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: categoryColor }}>
                Haber kaynakları
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">Kaynaklar</h2>

              <ul className="mt-4 space-y-3">
                {article.sources.map((source) => (
                  <li key={source.id}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-surface group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition"
                    >
                      <span>{source.name}</span>
                      <span style={{ color: categoryColor }}>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8" style={{ borderColor: "var(--border)" }}>
            <Link
              href={`/kategori/${article.category.slug}`}
              className="text-sm font-black transition"
              style={{ color: categoryColor }}
            >
              ← {article.category.name} haberlerine dön
            </Link>

            <Link href="/" className="news-muted text-sm font-bold transition hover:opacity-70">
              Ana sayfaya dön →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
