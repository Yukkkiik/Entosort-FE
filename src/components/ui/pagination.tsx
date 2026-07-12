"use client";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, onPageChange, className = "" }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsis = totalPages > 7;

  function getVisiblePages() {
    if (!showEllipsis) return pages;
    if (page <= 4) return [...pages.slice(0, 5), -1, totalPages];
    if (page >= totalPages - 3) return [1, -1, ...pages.slice(totalPages - 5)];
    return [1, -1, page - 1, page, page + 1, -2, totalPages];
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500
                   hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((p, i) =>
          p < 0 ? (
            <span key={p + "-" + i} className="px-1 text-gray-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-colors
                ${p === page
                  ? "bg-lime-500 text-white shadow-sm shadow-lime-200"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500
                   hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}