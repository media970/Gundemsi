import Link from "next/link";
import prisma from "../../lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function AdminPage() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  const publishedArticles = articles.filter(
    (article) => article.status === "PUBLISHED"
  );

  const draftArticles = articles.filter(
    (article) => article.status === "DRAFT"
  );

  const recentArticles = articles.slice(0, 5);

  const stats = [
    {
      title: "Toplam Haber",
      value: articles.length,
    },
    {
      title: "Yayındaki",
      value: publishedArticles.length,
    },
    {
      title: "Taslak",
      value: draftArticles.length,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b12] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              GÜNDEMSİ
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Yönetim Paneli
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Siteyi Gör
            </Link>

            <Link
              href="/admin/haberler"
              className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Haberler
            </Link>

            <Link
              href="/admin/ayarlar"
              className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-center text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
            >
              Ayarlar
            </Link>
            <LogoutButton />
          </div>
        </div>

        <section className="mt-6 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-[#111722] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-6"
            >
              <p className="text-sm text-slate-400">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-black">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-[#111722] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:mt-10 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              Son Haberler
            </h2>

            <Link
              href="/admin/haberler"
              className="shrink-0 text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              Tümünü Gör →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="mt-6 rounded-xl bg-[#0d111a] p-8 text-center text-sm text-slate-500">
              Henüz haber bulunmuyor.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-800">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold">
                      {article.title}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{article.category.name}</span>
                      <span>•</span>
                      <span>
                        {new Date(article.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      article.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {article.status === "PUBLISHED"
                      ? "Yayında"
                      : "Taslak"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}