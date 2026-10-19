import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the singles and sealed product in your cart before checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your cart</h1>
      <CartView />
    </div>
  );
}
