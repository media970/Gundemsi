import Link from "next/link";
import prisma from "../../../lib/prisma";
import MobileCategoryMenu from "../../components/MobileCategoryMenu";
import ThemeToggle from "../../components/ThemeToggle";
import { notFound } from "next/navigation";

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

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  const categoryColor =
    categories.find((item) => item.slug === slug)?.color ?? "#7c3aed";

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <>
      <style>{`
        .category-page {
          --page-bg: #f5f7fb;
          --surface: #ffffff;
          --surface-soft: #eef2f7;
          --text: #101828;
          --muted: #667085;
          --border: #e4e7ec;
        }

        html[data-theme="dark"] .category-page {
          --page-bg: #080b12;
          --surface: #111722;
          --surface-soft: #171e2b;
          --text: #f3f5f8;
          --muted: #98a2b3;
          --border: #263142;
        }

        .category-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--category-color) 11%, transparent), transparent 28rem),
            radial-gradient(circle at 92% 8%, rgba(37,99,235,.07), transparent 30rem),
            var(--page-bg);
          color: var(--text);
          transition: background .25s ease, color .25s ease;
        }

        .category-surface {
          background: var(--surface);
          border-color: var(--border);
        }

        .category-muted {
          color: var(--muted);
        }

        .category-card {
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 14px 40px rgba(16,24,40,.06);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        html[data-theme="dark"] .category-card {
          box-shadow: 0 18px 50px rgba(0,0,0,.25);
        }

        .category-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--category-color) 35%, var(--border));
          box-shadow: 0 20px 50px rgba(16,24,40,.10);
        }

        html[data-theme="dark"] .category-card:hover {
          box-shadow: 0 24px 60px rgba(0,0,0,.38);
        }

        .category-nav:hover {
          background: color-mix(in srgb, var(--category-color) 10%, var(--surface-soft));
          color: var(--category-color);
        }

        .category-home:hover {
          border-color: color-mix(in srgb, var(--category-color) 35%, var(--border)) !important;
          color: var(--category-color);
        }
      `}</style>

      <main
        className="category-page"
        style={{ ["--category-color" as string]: categoryColor }}
      >
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in srgb, var(--surface) 88%, transparent)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
            <Link href="/" className="shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg sm:h-10 sm:w-10"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}, #2563eb)`,
                  }}
                >
                  G
                </div>

                <div>
                  <div className="text-lg font-black tracking-[-0.04em] sm:text-2xl">
                    GÜNDEMSİ
                  </div>

                  <div className="category-muted -mt-0.5 hidden text-[10px] font-bold uppercase tracking-[0.2em] sm:block">
                    Gündeme değin.
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/"
              className="category-home ml-auto flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-bold transition sm:gap-2 sm:px-3 lg:ml-2"
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

            <nav className="hidden items-center gap-1 lg:flex">
              {categories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/kategori/${item.slug}`}
                  className="category-nav rounded-xl px-3 py-2 text-sm font-semibold transition"
                  style={{
                    ["--category-color" as string]: item.color,
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-3">
              <ThemeToggle />

              <div className="lg:hidden">
                <MobileCategoryMenu categories={categories} />
              </div>
            </div>
          </div>
        </header>

        <div
          className="border-b"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5 lg:px-8">
            <span className="shrink-0 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white sm:px-3 sm:text-[10px] sm:tracking-[0.16em]">
              Son Dakika
            </span>

            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

            <span className="category-muted truncate text-xs font-semibold sm:text-sm">
              GÜNDEMSİ&apos;de günün öne çıkan gelişmelerini takip et.
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-3 pb-10 pt-7 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
          <section className="mb-8 sm:mb-10">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] sm:mb-4 sm:text-xs sm:tracking-[0.18em]"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              Kategori
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black leading-none tracking-[-0.055em] sm:text-6xl">
                  {category.name}
                </h1>

                <p className="category-muted mt-3 max-w-2xl text-sm leading-6 sm:mt-4 sm:text-lg sm:leading-7">
                  {category.name} kategorisindeki güncel gelişmeleri ve
                  GÜNDEMSİ&apos;nin haber seçkisini burada takip et.
                </p>
              </div>

              <div
                className="inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black self-start sm:self-auto"
                style={{
                  background: `color-mix(in srgb, ${categoryColor} 11%, var(--surface))`,
                  color: categoryColor,
                }}
              >
                {articles.length} haber
              </div>
            </div>
          </section>

          {articles.length === 0 ? (
            <section className="category-surface rounded-3xl border border-dashed px-5 py-16 text-center sm:px-6 sm:py-20">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white"
                style={{ backgroundColor: categoryColor }}
              >
                G
              </div>

              <h2 className="text-xl font-black">
                Bu kategoride henüz haber yok.
              </h2>

              <p className="category-muted mt-2 text-sm">
                Yayınlanan haberler burada görünecek.
              </p>
            </section>
          ) : (
            <>
              {featuredArticle && (
                <section className="mb-10 sm:mb-12">
                  <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.2em]"
                        style={{ color: categoryColor }}
                      >
                        Kategorinin öne çıkanı
                      </p>
                      <h2 className="mt-1 text-xl font-black tracking-tight sm:text-3xl">
                        Gündemin Öne Çıkanı
                      </h2>
                    </div>

                    <span className="category-muted hidden text-xs font-bold sm:block">
                      1 / {articles.length}
                    </span>
                  </div>

                  <Link
                    href={`/haber/${featuredArticle.slug}`}
                    className="category-card group block overflow-hidden rounded-2xl sm:rounded-[1.75rem]"
                  >
                    <div className="grid lg:grid-cols-[1.45fr_1fr]">
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 lg:aspect-auto lg:min-h-[440px]">
                        {featuredArticle.coverImage ? (
                          <img
                            src={featuredArticle.coverImage}
                            alt={featuredArticle.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full min-h-[300px] items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <span className="category-muted text-sm">
                              Haber kapağı yok
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        <div className="absolute bottom-5 left-5">
                          <span
                            className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white"
                            style={{ backgroundColor: categoryColor }}
                          >
                            Öne Çıkan
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                        <span
                          className="text-xs font-black uppercase tracking-[0.18em]"
                          style={{ color: categoryColor }}
                        >
                          {featuredArticle.category.name}
                        </span>

                        <h2 className="mt-3 text-2xl font-black leading-[1.02] tracking-[-0.045em] sm:text-4xl">
                          {featuredArticle.title}
                        </h2>

                        <p className="category-muted mt-3 text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7">
                          {featuredArticle.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3 sm:mt-7 sm:gap-4">
                          <time
                            dateTime={featuredArticle.createdAt.toISOString()}
                            className="category-muted text-xs font-semibold"
                          >
                            {featuredArticle.createdAt.toLocaleDateString(
                              "tr-TR"
                            )}
                          </time>

                          <span
                            className="text-sm font-black"
                            style={{ color: categoryColor }}
                          >
                            Haberi oku →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              {remainingArticles.length > 0 && (
                <section>
                  <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
                    <div>
                      <p
                        className="text-xs font-black uppercase tracking-[0.2em]"
                        style={{ color: categoryColor }}
                      >
                        Güncel akış
                      </p>
                      <h2 className="mt-1 text-xl font-black tracking-tight sm:text-3xl">
                        Son Haberler
                      </h2>
                    </div>

                    <span className="category-muted text-xs font-bold">
                      {remainingArticles.length} haber
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                    {remainingArticles.map((article) => (
                      <article
                        key={article.id}
                        className="category-card group overflow-hidden rounded-2xl"
                      >
                        <Link
                          href={`/haber/${article.slug}`}
                          className="block"
                        >
                          {article.coverImage ? (
                            <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                              <img
                                src={article.coverImage}
                                alt={article.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 dark:bg-slate-800">
                              <span className="category-muted text-sm">
                                Haber kapağı yok
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-3">
                            <Link
                              href={`/kategori/${article.category.slug}`}
                              className="text-[11px] font-black uppercase tracking-[0.16em] transition"
                              style={{ color: categoryColor }}
                            >
                              {article.category.name}
                            </Link>

                            <time
                              dateTime={article.createdAt.toISOString()}
                              className="category-muted text-[11px] font-semibold"
                            >
                              {article.createdAt.toLocaleDateString("tr-TR")}
                            </time>
                          </div>

                          <Link href={`/haber/${article.slug}`}>
                            <h3 className="mt-3 text-lg font-black leading-[1.12] tracking-[-0.02em] transition sm:text-xl">
                              {article.title}
                            </h3>
                          </Link>

                          <p className="category-muted mt-3 line-clamp-2 text-sm leading-6">
                            {article.description}
                          </p>

                          <Link
                            href={`/haber/${article.slug}`}
                            className="mt-4 inline-flex text-xs font-black sm:mt-5"
                            style={{ color: categoryColor }}
                          >
                            Haberi oku →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}