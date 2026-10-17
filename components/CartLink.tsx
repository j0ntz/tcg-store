"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export const CartLink: React.FC = () => {
  const { hydrated, count } = useCart();
  return (
    <Link href="/cart" className="flex items-center gap-2 no-underline font-medium text-sm shrink-0">
      Cart
      <span
        aria-label={`${count} items in cart`}
        className="num inline-flex min-w-6 h-6 px-1.5 items-center justify-center rounded-full bg-brand text-brand-ink text-xs font-semibold"
      >
        {hydrated ? count : 0}
      </span>
    </Link>
  );
};
