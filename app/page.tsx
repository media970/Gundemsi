import Link from "next/link";
import prisma from "../lib/prisma";
import MobileCategoryMenu from "./components/MobileCategoryMenu";
import ThemeToggle from "./components/ThemeToggle";

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

export default async function Home() {
  const featuredArticle = await prisma.article.findFirst({
    where: {
      status: "PUBLISHED",
      isFeatured: true,
    },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const news = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(featuredArticle ? { id: { not: featuredArticle.id } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { category: true },
  });

  const featured = featuredArticle ?? news[0];
  const remainingNews = featuredArticle ? news : news.slice(1);

  const getCategoryColor = (slug: string) =>
    categories.find((category) => category.slug === slug)?.color ?? "#7c3aed";

  return (
    <>
      <style>{`
        .gundemsi-page {
          --page-bg: #f5f7fb;
          --surface: #ffffff;
          --surface-soft: #eef2f7;
          --text: #101828;
          --muted: #667085;
          --border: #e4e7ec;
          --accent: #7c3aed;
          --accent-2: #2563eb;
          --accent-soft: #ede9fe;
        }

        html[data-theme="dark"] .gundemsi-page {
          --page-bg: #080b12;
          --surface: #111722;
          --surface-soft: #171e2b;
          --text: #f3f5f8;
          --muted: #98a2b3;
          --border: #263142;
          --accent: #a78bfa;
          --accent-2: #60a5fa;
          --accent-soft: #241b3d;
        }

        .gundemsi-page {
          background:
            radial-gradient(circle at 8% 0%, rgba(124,58,237,.10), transparent 28rem),
            radial-gradient(circle at 92% 8%, rgba(37,99,235,.09), transparent 30rem),
            var(--page-bg);
          color: var(--text);
          transition: background .25s ease, color .25s ease;
        }

        .gundemsi-surface {
          background: var(--surface);
          border-color: var(--border);
          transition: background .25s ease, border-color .25s ease;
        }

        .gundemsi-muted {
          color: var(--muted);
        }

        .gundemsi-nav:hover {
          background: color-mix(in srgb, var(--category-color) 10%, var(--surface-soft));
          color: var(--category-color);
        }

        .theme-toggle {
          display: inline-flex;
          height: 42px;
          width: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--surface);
          color: var(--text);
          transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }

        .theme-toggle:hover {
          transform: translateY(-1px);
          background: var(--surface-soft);
        }

        .gundemsi-card {
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 14px 40px rgba(16,24,40,.06);
          transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
        }

        html[data-theme="dark"] .gundemsi-card {
          box-shadow: 0 18px 50px rgba(0,0,0,.25);
        }

        .gundemsi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(16,24,40,.10);
        }

        html[data-theme="dark"] .gundemsi-card:hover {
          box-shadow: 0 24px 60px rgba(0,0,0,.38);
        }

        .gundemsi-gradient {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
        }

        .gundemsi-chip {
          background: var(--accent-soft);
          color: var(--accent);
        }
      `}</style>

      <main className="gundemsi-page min-h-screen">
        <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}>
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
            <Link href="/" className="shrink-0">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="gundemsi-gradient flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg shadow-violet-500/20">
                  G
                </div>
                <div>
                  <div className="text-lg font-black tracking-[-0.04em] sm:text-2xl">
                    GÜNDEMSİ
                  </div>
                  <div className="gundemsi-muted -mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.2em]">
                    Gündeme değin.
                  </div>
                </div>
              </div>
            </Link>

            <nav className="ml-auto hidden items-center gap-1 lg:flex">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/kategori/${category.slug}`}
                  className="gundemsi-nav rounded-xl px-3 py-2 text-sm font-semibold transition"
                  style={{ ["--category-color" as string]: category.color }}
                >
                  {category.name}
                </Link>
              ))}
            </nav>

<div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
  <div
    className="relative z-[60] shrink-0"
    style={{
      pointerEvents: "auto",
      touchAction: "manipulation",
    }}
  >
    <ThemeToggle />
  </div>

  <div className="relative z-[50] shrink-0 lg:hidden">
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
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden px-4 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
            <span className="shrink-0 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white sm:px-3 sm:text-[10px] sm:tracking-[0.16em]">
              Son Dakika
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <span className="gundemsi-muted truncate text-xs font-semibold sm:text-sm">
              GÜNDEMSİ&apos;de günün öne çıkan gelişmelerini takip et.
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
          <section className="mb-8 grid gap-6 sm:mb-10 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] sm:mb-4 sm:text-xs sm:tracking-[0.18em]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Güncel
              </div>

              <h1 className="max-w-4xl break-words text-4xl font-black leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Gündemde ne varsa,
                <span className="block bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
                  burada.
                </span>
              </h1>

              <p className="gundemsi-muted mt-4 max-w-2xl text-sm leading-6 sm:mt-5 sm:text-lg sm:leading-7">
                Günün önemli gelişmelerini, farklı kategorileri ve GÜNDEMSİ&apos;nin
                haber seçkisini tek yerde takip et.
              </p>
            </div>

            <div className="hidden text-right lg:block">
              <div className="gundemsi-muted text-xs font-bold uppercase tracking-[0.2em]">
                Bugünün akışı
              </div>
              <div className="mt-2 text-3xl font-black">
                {remainingNews.length + (featured ? 1 : 0)} haber
              </div>
            </div>
          </section>

          {!featured ? (
            <section className="gundemsi-surface rounded-3xl border p-12 text-center">
              <p className="gundemsi-muted">Henüz yayınlanmış haber bulunmuyor.</p>
            </section>
          ) : (
            <>
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>
                      Öne çıkan
                    </p>
                    <h2 className="text-xl font-black tracking-tight sm:text-3xl">
                      Gündemin Öne Çıkanı
                    </h2>
                  </div>
                  <Link
                    href={`/kategori/${featured.category.slug}`}
                    className="gundemsi-muted hidden text-sm font-bold transition hover:opacity-70 sm:block"
                  >
                    {featured.category.name} →
                  </Link>
                </div>

                <article className="gundemsi-card group overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem]">
                  <Link href={`/haber/${featured.slug}`} className="grid lg:grid-cols-[1.35fr_1fr]">
                    {featured.coverImage ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-black sm:aspect-[16/10] lg:aspect-auto lg:min-h-[430px]">
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="gundemsi-gradient flex min-h-[300px] items-center justify-center lg:min-h-[430px]">
                        <span className="text-sm font-bold text-white/70">Haber kapağı</span>
                      </div>
                    )}

                    <div className="flex min-w-0 flex-col justify-center p-5 sm:p-9 lg:p-12">
                      <span
                        className="mb-4 w-fit max-w-full rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] sm:mb-5 sm:text-xs sm:tracking-[0.14em]"
                        style={{
                          background: `color-mix(in srgb, ${getCategoryColor(featured.category.slug)} 14%, var(--surface))`,
                          color: getCategoryColor(featured.category.slug),
                        }}
                      >
                        {featured.category.name}
                      </span>

                      <h3 className="break-words text-2xl font-black leading-[1.08] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                        {featured.title}
                      </h3>

                      <p className="gundemsi-muted mt-4 line-clamp-4 text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7">
                        {featured.description}
                      </p>

                      <div className="mt-6 flex flex-col items-start gap-2 border-t pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-5" style={{ borderColor: "var(--border)" }}>
                        <span className="gundemsi-muted text-xs font-semibold">
                          {new Date(featured.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        <span className="text-sm font-black" style={{ color: "var(--accent)" }}>
                          Haberi oku →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </section>

              {remainingNews.length > 0 && (
                <section className="mt-10 sm:mt-14">
                  <div className="mb-4 flex items-end justify-between sm:mb-5">
                    <div>
                      <p className="mb-1 text-sm font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>
                        Akış
                      </p>
                      <h2 className="text-xl font-black tracking-tight sm:text-3xl">
                        Son Haberler
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {remainingNews.map((item) => (
                      <article key={item.id} className="gundemsi-card group overflow-hidden rounded-2xl sm:rounded-3xl">
                        <Link href={`/haber/${item.slug}`}>
                          {item.coverImage ? (
                            <div className="relative aspect-[16/10] overflow-hidden bg-black">
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                          ) : (
                            <div className="gundemsi-gradient flex aspect-[16/10] items-center justify-center">
                              <span className="text-sm font-bold text-white/70">Haber kapağı</span>
                            </div>
                          )}
                        </Link>

                        <div className="p-4 sm:p-6">
                          <Link
                            href={`/kategori/${item.category.slug}`}
                            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]"
                            style={{
                              background: `color-mix(in srgb, ${getCategoryColor(item.category.slug)} 14%, var(--surface))`,
                              color: getCategoryColor(item.category.slug),
                            }}
                          >
                            {item.category.name}
                          </Link>

                          <Link href={`/haber/${item.slug}`}>
                            <h3 className="mt-3 break-words text-lg font-black leading-tight tracking-[-0.02em] transition group-hover:opacity-70 sm:mt-4 sm:text-xl">
                              {item.title}
                            </h3>
                          </Link>

                          <p className="gundemsi-muted mt-3 line-clamp-3 text-sm leading-6">
                            {item.description}
                          </p>

                          <div className="gundemsi-muted mt-5 flex items-center justify-between text-xs font-semibold">
                            <span>
                              {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                            <Link
                              href={`/haber/${item.slug}`}
                              className="font-black"
                              style={{ color: "var(--accent)" }}
                            >
                              Oku →
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-xs sm:gap-3 sm:py-8 sm:text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span className="gundemsi-muted">
              © 2026 GÜNDEMSİ — Gündeme değin.
            </span>
            <span className="gundemsi-muted">
              Haber, gündem ve daha fazlası.
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
