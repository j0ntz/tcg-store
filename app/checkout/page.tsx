import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Contact, shipping address, and shipping method for your order.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
