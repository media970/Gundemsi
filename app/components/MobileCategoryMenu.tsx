import Link from "next/link";

interface Category {
  name: string;
  slug: string;
}

interface MobileCategoryMenuProps {
  categories: Category[];
}

export default function MobileCategoryMenu({
  categories,
}: MobileCategoryMenuProps) {
  return (
    <details className="relative md:hidden">
      <summary className="flex w-fit max-w-full shrink-0 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-700 bg-[#111722] px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm">
        <span className="text-xl leading-none">☰</span>
        <span>Kategoriler</span>
      </summary>

      <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
        <div className="grid grid-cols-1 gap-1">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}