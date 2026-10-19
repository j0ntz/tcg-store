import Link from "next/link";
import { STORE_NAME, TRADEMARK_NOTICE } from "@/lib/store";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line mt-16">
      <div className="container py-8 flex flex-col gap-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/shop" className="no-underline hover:text-brand">
            Singles
          </Link>
          <Link href="/sealed" className="no-underline hover:text-brand">
            Sealed
          </Link>
          <Link href="/sets" className="no-underline hover:text-brand">
            Sets
          </Link>
          <Link href="/cart" className="no-underline hover:text-brand">
            Cart
          </Link>
        </nav>
        <p className="text-xs text-ink-2 max-w-3xl">
          © 2026 {STORE_NAME}. {TRADEMARK_NOTICE}
        </p>
      </div>
    </footer>
  );
};
