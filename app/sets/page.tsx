import type { Metadata } from "next";
import { SetTile, TileGrid } from "@/components/Tiles";
import { sets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Sets",
  description: "Pokémon TCG sets we stock singles from, newest first.",
};

export default function SetsPage() {
  return (
    <div className="container py-8 flex flex-col gap-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Sets</h1>
        <p className="num text-sm text-ink-2">
          {sets.length} sets
        </p>
      </div>
      <TileGrid>
        {sets.map((set) => (
          <SetTile key={set.id} set={set} />
        ))}
      </TileGrid>
    </div>
  );
}
