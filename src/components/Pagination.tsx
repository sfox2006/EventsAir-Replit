export function Pagination({
  total,
  page,
  setPage,
  size = 50,
}: {
  total: number;
  page: number;
  setPage: (n: number) => void;
  size?: number;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        {total ? (page - 1) * size + 1 : 0} - {Math.min(page * size, total)} of{" "}
        {total} items
      </span>
      <div>
        <button
          aria-label="First page"
          disabled={page <= 1}
          onClick={() => setPage(1)}
        >
          «
        </button>
        <button
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            className={page === i + 1 ? "active" : ""}
            key={i}
            onClick={() => setPage(i + 1)}
            aria-label={`Page ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          ›
        </button>
        <button
          aria-label="Last page"
          disabled={page >= pages}
          onClick={() => setPage(pages)}
        >
          »
        </button>
      </div>
    </div>
  );
}
