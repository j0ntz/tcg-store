"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderSearch } from "./HeaderSearch";

const NAV = [
  { href: "/shop", label: "Singles" },
  { href: "/sealed", label: "Sealed" },
  { href: "/sets", label: "Sets" },
];

// Checkout drops nav and search. The phone search row lives in Header, below this bar.
export const HeaderChrome: React.FC = () => {
  const pathname = usePathname();
  if (pathname === "/checkout") return <div className="flex-1" />;
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
        <HeaderSearch id="header-q" className="hidden sm:block w-full max-w-xs" />
      </div>
    </>
  );
};
