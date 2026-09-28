"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface Article {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  content: string;
  comment: string;
  sources: {
    name: string;
    url: string;
  }[];
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
}

interface EditNewsClientProps {
  article: Article;
}

export default function EditNewsClient({
  article,
}: EditNewsClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(
    article.description
  );
  const [categorySlug, setCategorySlug] = useState(
    article.categorySlug
  );
  const [content, setContent] = useState(article.content);
  const [comment, setComment] = useState(article.comment);
  const [sources, setSources] = useState(
    article.sources
      .map((source) => `${source.name} | ${source.url}`)
      .join("\n")
  );
  const [tags, setTags] = useState(
    article.tags.join(", ")
  );
  const [status, setStatus] = useState<
    "DRAFT" | "PUBLISHED"
  >(article.status);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  async function saveArticle(
    newStatus: "DRAFT" | "PUBLISHED"
  ) {
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const sourceList = sources
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("|");

          if (separator === -1) {
            return {
              name: "Kaynak",
              url: line,
            };
          }

          return {
            name: line.slice(0, separator).trim(),
            url: line.slice(separator + 1).trim(),
          };
        });

      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch(
        `/api/admin/haberler/${article.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            categorySlug,
            content,
            comment,
            sources: sourceList,
            tags: tagList,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Haber güncellenemedi."
        );
      }

      setStatus(newStatus);

      setMessage(
        newStatus === "PUBLISHED"
          ? "Haber başarıyla güncellendi ve yayınlandı."
          : "Taslak başarıyla güncellendi."
      );

      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Haber güncellenirken bir hata oluştu."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              GÜNDEMSİ
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Haberi Düzenle
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/haberler")
            }
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-gray-100"
          >
            ← Geri
          </button>
        </div>

        <div className="mt-10 space-y-6">

          {/* BAŞLIK */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Haber Başlığı
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* AÇIKLAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kısa Açıklama
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* KATEGORİ */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kategori
            </label>

            <select
              value={categorySlug}
              onChange={(event) =>
                setCategorySlug(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            >
              <option value="" disabled>
                Kategori seç
              </option>

              {categories.map((category) => (
                <option
                  key={category.slug}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* KAPAK */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kapak Görseli
            </label>

            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">
                Görsel yükleme alanı
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Görsel sistemini daha sonra bağlayacağız.
              </p>
            </div>
          </div>

          {/* İÇERİK */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Haber İçeriği
            </label>

            <textarea
              rows={12}
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* YORUM */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              GÜNDEMSİ&apos;NİN Yorumu
            </label>

            <textarea
              rows={6}
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* KAYNAKLAR */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Kaynaklar
            </label>

            <textarea
              rows={4}
              value={sources}
              onChange={(event) =>
                setSources(event.target.value)
              }
              placeholder={
                "Her satıra bir kaynak yaz.\nÖrn: Reuters | https://example.com/haber"
              }
              className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* ETİKETLER */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Etiketler
            </label>

            <input
              type="text"
              value={tags}
              onChange={(event) =>
                setTags(event.target.value)
              }
              placeholder="Örn: yapay zeka, teknoloji, OpenAI"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-gray-400"
            />
          </div>

          {/* DURUM */}
          <div>
            <p className="mb-2 text-sm font-semibold">
              Mevcut Durum
            </p>

            <span
              className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${
                status === "PUBLISHED"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {status === "PUBLISHED"
                ? "Yayında"
                : "Taslak"}
            </span>
          </div>

          {/* MESAJ */}
          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* BUTONLAR */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveArticle("DRAFT")
              }
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Kaydediliyor..."
                : "Taslak Kaydet"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveArticle("PUBLISHED")
              }
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Yayınlanıyor..."
                : "Yayınla"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}