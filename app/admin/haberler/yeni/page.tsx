"use client";

import { ChangeEvent, FormEvent, useState } from "react";

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

type BlockType = "TEXT" | "IMAGE";

type ArticleBlock = {
  id: string;
  type: BlockType;
  content: string;
};

function createBlock(type: BlockType): ArticleBlock {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    content: "",
  };
}

async function cropCoverTo16x9(file: File): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Görsel okunamadı."));
      img.src = sourceUrl;
    });

    const targetRatio = 16 / 9;
    const sourceRatio = image.width / image.height;

    let cropWidth = image.width;
    let cropHeight = image.height;
    let offsetX = 0;
    let offsetY = 0;

    if (sourceRatio > targetRatio) {
      cropWidth = image.height * targetRatio;
      offsetX = (image.width - cropWidth) / 2;
    } else if (sourceRatio < targetRatio) {
      cropHeight = image.width / targetRatio;
      offsetY = (image.height - cropHeight) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Görsel işlenemedi.");
    }

    context.drawImage(
      image,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const outputType =
      file.type === "image/png" || file.type === "image/webp"
        ? file.type
        : "image/jpeg";

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Görsel oluşturulamadı."));
        },
        outputType,
        0.92
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function NewNewsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [sources, setSources] = useState("");
  const [tags, setTags] = useState("");

  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  function addBlock(type: BlockType) {
    setBlocks((current) => [...current, createBlock(type)]);
  }

  function updateBlock(id: string, content: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
  }

  function moveBlock(id: string, direction: "up" | "down") {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);

      if (index === -1) return current;

      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

      return next;
    });
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setUploadingCover(true);
      setMessage("");
      setMessageType("");

      const croppedBlob = await cropCoverTo16x9(file);

      const formData = new FormData();
      formData.append(
        "file",
        new File([croppedBlob], "cover.jpg", {
          type: croppedBlob.type,
        })
      );

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kapak görseli yüklenemedi.");
      }

      setCoverImage(data.url);
      setMessage("Kapak görseli hazırlandı ve yüklendi.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Kapak görseli yüklenirken bir hata oluştu."
      );
      setMessageType("error");
    } finally {
      setUploadingCover(false);
    }
  }

  async function saveArticle(status: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      if (!coverImage) {
        throw new Error("Haber kapağı eklemelisin.");
      }

      const validBlocks = blocks.filter((block) => block.content.trim());

      if (validBlocks.length === 0) {
        throw new Error("En az bir dolu içerik bloğu eklemelisin.");
      }

      const sourceList = sources
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("|");

          if (separator === -1) {
            return { name: "Kaynak", url: line };
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

      const response = await fetch("/api/admin/haberler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          categorySlug,
          coverImage,
          blocks: validBlocks.map((block) => ({
            type: block.type,
            content: block.content,
          })),
          sources: sourceList,
          tags: tagList,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Haber kaydedilemedi.");
      }

      setMessage(
        status === "PUBLISHED"
          ? "Haber başarıyla yayınlandı."
          : "Taslak başarıyla kaydedildi."
      );
      setMessageType("success");

      if (status === "PUBLISHED") {
        setTitle("");
        setDescription("");
        setCategorySlug("");
        setCoverImage("");
        setBlocks([]);
        setSources("");
        setTags("");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveArticle("PUBLISHED");
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              GÜNDEMSİ
            </p>
            <h1 className="mt-1 text-3xl font-black">Yeni Haber</h1>
          </div>

          <a
            href="/admin/haberler"
            className="rounded-xl border border-slate-800 bg-[#111722] px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-800"
          >
            ← Geri
          </a>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-[#111722] p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Haber Bilgileri</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Haber Başlığı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Haber başlığını yaz..."
                  required
                  className="w-full rounded-xl border border-slate-800 px-4 py-3 outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Kısa Açıklama
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Haberin kısa açıklamasını yaz..."
                  required
                  className="w-full resize-none rounded-xl border border-slate-800 px-4 py-3 outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Kategori
                </label>
                <select
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 px-4 py-3 outline-none transition focus:border-violet-500"
                >
                  <option value="" disabled>
                    Kategori seç
                  </option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <label className="block text-sm font-semibold">
                      Haber Kapağı
                    </label>
                    <p className="mt-1 text-xs text-slate-400">
                      YouTube kapağı gibi düşün: sistem görseli otomatik olarak
                      16:9 oranına kırpar.
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
                    16:9 ZORUNLU
                  </span>
                </div>

                <label className="mt-3 block cursor-pointer rounded-2xl border-2 border-dashed border-slate-800 bg-[#0d111a] p-4 transition hover:border-violet-500">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={uploadCover}
                    disabled={uploadingCover}
                  />

                  {coverImage ? (
                    <div className="overflow-hidden rounded-xl bg-slate-800">
                      <img
                        src={coverImage}
                        alt="Haber kapağı"
                        className="aspect-video w-full object-cover"
                      />
                      <div className="px-3 py-2 text-center text-xs font-semibold text-slate-400">
                        Değiştirmek için tıkla
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-xl bg-[#111722] text-sm font-semibold text-slate-400">
                      {uploadingCover
                        ? "Kapak hazırlanıyor..."
                        : "Bilgisayardan kapak görseli seç"}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111722] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-black">Haber İçeriği</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Yazı ve görselleri istediğin sırada, sınırsız şekilde ekle.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addBlock("IMAGE")}
                  className="rounded-xl border border-slate-800 bg-[#111722] px-4 py-2.5 text-sm font-bold transition hover:bg-slate-800"
                >
                  + Görsel Ekle
                </button>

                <button
                  type="button"
                  onClick={() => addBlock("TEXT")}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  + Yazı Ekle
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-800 bg-[#0d111a] p-10 text-center">
                <p className="font-semibold text-slate-300">
                  Henüz içerik eklenmedi.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Yukarıdaki butonlardan görsel veya yazı ekleyebilirsin.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-slate-800 bg-[#0d111a] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                          BLOK {index + 1}
                        </p>
                        <p className="mt-1 font-bold">
                          {block.type === "IMAGE" ? "Görsel" : "Yazı"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveBlock(block.id, "up")}
                          disabled={index === 0}
                          className="rounded-lg border border-slate-800 bg-[#111722] px-2.5 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(block.id, "down")}
                          disabled={index === blocks.length - 1}
                          className="rounded-lg border border-slate-800 bg-[#111722] px-2.5 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="rounded-lg border border-red-500/30 bg-[#111722] px-3 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/10"
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {block.type === "IMAGE" ? (
                        <>
                          <label className="inline-flex cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700">
                            Bilgisayardan Görsel Seç
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                              className="hidden"
                              onChange={async (event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";

                                if (!file) return;

                                try {
                                  setMessage("Görsel yükleniyor...");
                                  setMessageType("");

                                  const formData = new FormData();
                                  formData.append("file", file);

                                  const response = await fetch(
                                    "/api/admin/upload",
                                    {
                                      method: "POST",
                                      body: formData,
                                    }
                                  );

                                  const data = await response.json();

                                  if (!response.ok) {
                                    throw new Error(
                                      data.error || "Görsel yüklenemedi."
                                    );
                                  }

                                  updateBlock(block.id, data.url);
                                  setMessage("Görsel başarıyla yüklendi.");
                                  setMessageType("success");
                                } catch (error) {
                                  setMessage(
                                    error instanceof Error
                                      ? error.message
                                      : "Görsel yüklenirken bir hata oluştu."
                                  );
                                  setMessageType("error");
                                }
                              }}
                            />
                          </label>

                          {block.content.trim() && (
                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#111722]">
                              <img
                                src={block.content}
                                alt={`Haber görseli ${index + 1}`}
                                className="max-h-[500px] w-full object-contain"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <label className="mb-2 block text-sm font-semibold">
                            Yazı
                          </label>
                          <textarea
                            rows={8}
                            value={block.content}
                            onChange={(event) =>
                              updateBlock(block.id, event.target.value)
                            }
                            placeholder="Haber metnini yaz..."
                            className="w-full resize-y rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 leading-7 outline-none transition focus:border-violet-500"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blocks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => addBlock("IMAGE")}
                  className="rounded-xl border border-slate-800 bg-[#111722] px-4 py-2.5 text-sm font-bold transition hover:bg-slate-800"
                >
                  + Görsel Ekle
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("TEXT")}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  + Yazı Ekle
                </button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111722] p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Kaynaklar ve Etiketler</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Kaynaklar
                </label>
                <textarea
                  rows={4}
                  value={sources}
                  onChange={(event) => setSources(event.target.value)}
                  placeholder={
                    "Her satıra bir kaynak yaz.\nÖrn: Reuters | https://example.com/haber"
                  }
                  className="w-full resize-y rounded-xl border border-slate-800 px-4 py-3 outline-none transition focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Etiketler
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="Örn: yapay zeka, teknoloji, OpenAI"
                  className="w-full rounded-xl border border-slate-800 px-4 py-3 outline-none transition focus:border-violet-500"
                />
              </div>
            </div>
          </section>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                messageType === "success"
                  ? "border-green-200 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => saveArticle("DRAFT")}
              className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
            </button>

            <button
              type="submit"
              disabled={saving || uploadingCover}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Yayınlanıyor..." : "Yayınla"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}