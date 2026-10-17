"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/shop", label: "Singles" },
  { href: "/sealed", label: "Sealed" },
  { href: "/sets", label: "Sets" },
];

// Checkout drops nav and search; the home page carries its own hero search instead of the header one.
export const HeaderChrome: React.FC = () => {
  const pathname = usePathname();
  if (pathname === "/checkout") return <div className="flex-1" />;
  const showSearch = pathname !== "/";
  return (
    <>
      <nav aria-label="Shop" className="flex items-center gap-4 text-sm font-medium">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`no-underline hover:text-brand ${pathname.startsWith(item.href) ? "text-brand" : "text-ink"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1 flex justify-end">
        {showSearch ? (
          <form action="/shop" method="get" role="search" className="hidden sm:block w-full max-w-xs">
            <label htmlFor="header-q" className="sr-only">
              Search singles
            </label>
            <input id="header-q" name="q" type="search" className="input" placeholder="Search singles" autoComplete="off" />
          </form>
        ) : null}
      </div>
    </>
  );
};
