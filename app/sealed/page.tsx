import type { Metadata } from "next";
import { SealedTile, TileGrid } from "@/components/Tiles";
import { sealed } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Sealed product",
  description: "Factory-sealed Pokémon TCG Elite Trainer Boxes, booster bundles, booster boxes, and packs, limited per order.",
};

export default function SealedPage() {
  const inStock = sealed.filter((p) => p.quantity > 0);
  const soldOut = sealed.filter((p) => p.quantity === 0);
  return (
    <div className="container py-8 flex flex-col gap-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Sealed product</h1>
        <p className="num text-sm text-ink-2">
          {sealed.length} {sealed.length === 1 ? "product" : "products"}
        </p>
      </div>
      <p className="text-sm text-ink-2 max-w-2xl">Every sealed item has a purchase limit so stock reaches more than one buyer. Boxes ship padded, and bundles and packs ship with singles in the same mailer.</p>
      <TileGrid>
        {[...inStock, ...soldOut].map((product) => (
          <SealedTile key={product.id} product={product} />
        ))}
      </TileGrid>
    </div>
  );
}
