import Icon from "@/components/icons";

export default function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-brand-black/10 px-1 py-3 text-sm">
      <p className="text-brand-black/50">
        Showing {from}–{to} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-black/15 text-brand-black/60 hover:border-brand-gold hover:text-brand-gold disabled:opacity-30"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
        <span className="text-brand-black/70">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-black/15 text-brand-black/60 hover:border-brand-gold hover:text-brand-gold disabled:opacity-30"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
