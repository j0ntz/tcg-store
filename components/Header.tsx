import Link from "next/link";
import { PROMISE_BAR, STORE_NAME } from "@/lib/store";
import { CartLink } from "./CartLink";
import { HeaderChrome } from "./HeaderChrome";
import { HeaderSearch } from "./HeaderSearch";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-line bg-surface">
      <p className="bg-surface-2 text-xs text-ink-2 text-center px-4 py-1.5 truncate">{PROMISE_BAR}</p>
      <div className="container">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="font-display font-extrabold text-lg text-brand no-underline shrink-0">
            {STORE_NAME}
          </Link>
          <HeaderChrome />
          <CartLink />
        </div>
        <HeaderSearch id="header-q-phone" className="sm:hidden pb-3" />
      </div>
    </header>
  );
};
