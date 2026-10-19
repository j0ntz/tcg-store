import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-16">
      <div className="notice flex flex-col gap-3 max-w-xl">
        <h1 className="text-2xl font-bold">There is no page here</h1>
        <p className="text-sm text-ink-2">The card or product may have been removed, or the link has a typo.</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/shop" className="btn btn-primary">
            Shop singles
          </Link>
          <Link href="/" className="btn btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
