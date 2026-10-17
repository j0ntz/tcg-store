"use client";

import { usePathname } from "next/navigation";

interface Props {
  id: string;
  className: string;
}

// One GET form, mounted twice in the header (inline on wide screens, its own row on phones) so
// that search stays reachable at every width. Home carries the hero search instead, and
// checkout drops search entirely.
export const HeaderSearch: React.FC<Props> = (props) => {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/checkout") return null;
  return (
    <form action="/shop" method="get" role="search" className={props.className}>
      <label htmlFor={props.id} className="sr-only">
        Search singles
      </label>
      <input id={props.id} name="q" type="search" className="input" placeholder="Search singles" autoComplete="off" />
    </form>
  );
};
