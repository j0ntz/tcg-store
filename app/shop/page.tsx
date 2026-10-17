import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ActiveChips } from "@/components/shop/ActiveChips";
import { Pagination } from "@/components/shop/Pagination";
import { ShopControls } from "@/components/shop/ShopControls";
import { CardTile, TileGrid } from "@/components/Tiles";
import { RARITIES, TYPES, getSetBySlug, parseShopQuery, searchCards, sets, shopHref } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop singles",
  description: "Search and filter Pokémon TCG singles by set, rarity, type, condition, and price.",
};

const Results: React.FC<{ searchParams: PageProps<"/shop">["searchParams"] }> = async (props) => {
  const query = parseShopQuery(await props.searchParams);
  const result = searchCards(query);
  const onlySet = query.set.length === 1 ? getSetBySlug(query.set[0]) : undefined;
  const heading = query.q !== "" ? `Results for “${query.q}”` : onlySet != null ? onlySet.name : "Singles";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="num text-sm text-ink-2">
          {result.total} {result.total === 1 ? "card" : "cards"}
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
        <ShopControls query={query} sets={sets} rarities={RARITIES} types={TYPES} total={result.total} />
        <div className="flex flex-col gap-6 min-w-0 md:col-start-2 md:row-start-1 md:row-span-2">
          <ActiveChips query={query} />
          {result.items.length === 0 ? (
            <div className="notice flex flex-col gap-3 max-w-xl">
              <p className="font-semibold">No cards match</p>
              <p className="text-sm text-ink-2">
                {query.instock
                  ? "Try fewer filters, or include sold-out cards to see everything we have listed."
                  : "Try fewer filters or a shorter search."}
              </p>
              <div className="flex gap-2 flex-wrap">
                {query.instock ? (
                  <Link href={shopHref({ ...query, instock: false, page: 1 })} className="btn btn-secondary">
                    Include sold out
                  </Link>
                ) : null}
                <Link href="/shop" className="btn btn-primary">
                  Clear the search
                </Link>
              </div>
            </div>
          ) : (
            <TileGrid>
              {result.items.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </TileGrid>
          )}
          <Pagination query={query} page={result.page} pageCount={result.pageCount} />
        </div>
      </div>
    </div>
  );
};

export default function ShopPage(props: PageProps<"/shop">) {
  return (
    <div className="container py-8">
      <Suspense fallback={<p className="text-ink-2">Loading singles…</p>}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
