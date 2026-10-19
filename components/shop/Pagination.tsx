import Link from "next/link";
import { shopHref, type ShopQuery } from "@/lib/catalog";

export const Pagination: React.FC<{ query: ShopQuery; page: number; pageCount: number }> = (props) => {
  const { query, page, pageCount } = props;
  if (pageCount <= 1) return null;
  const prev = page > 1 ? shopHref({ ...query, page: page - 1 }) : null;
  const next = page < pageCount ? shopHref({ ...query, page: page + 1 }) : null;
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-4 pt-6 border-t border-line">
      {prev == null ? (
        <span className="btn btn-secondary" aria-disabled="true">
          Previous
        </span>
      ) : (
        <Link href={prev} className="btn btn-secondary">
          Previous
        </Link>
      )}
      <span className="num text-sm text-ink-2">
        Page {page} of {pageCount}
      </span>
      {next == null ? (
        <span className="btn btn-secondary" aria-disabled="true">
          Next
        </span>
      ) : (
        <Link href={next} className="btn btn-secondary">
          Next
        </Link>
      )}
    </nav>
  );
};
