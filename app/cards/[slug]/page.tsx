import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardBuyBox } from "@/components/CardBuyBox";
import { SectionHeading } from "@/components/SectionHeading";
import { CardTile, TileGrid } from "@/components/Tiles";
import { cardNumberLabel, cards, cardsInSet, cheapestInStock, getCard, getSet } from "@/lib/catalog";
import { money } from "@/lib/format";
import { conditionName } from "@/lib/store";

export function generateStaticParams() {
  return cards.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata(props: PageProps<"/cards/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const card = getCard(slug);
  if (card == null) return { title: "Card not found" };
  const set = getSet(card.setId);
  const best = cheapestInStock(card);
  const title = `${card.name} ${cardNumberLabel(card)} · ${set?.name ?? card.setId}`;
  const description =
    best == null
      ? `${card.name} from ${set?.name ?? card.setId} is sold out in every condition.`
      : `${card.name} (${card.rarity}) from ${set?.name ?? card.setId}, from ${money(best.price)} in ${conditionName(best.condition)}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: card.imageLarge, alt: `${card.name} ${cardNumberLabel(card)}` }] },
  };
}

export default async function CardPage(props: PageProps<"/cards/[slug]">) {
  const { slug } = await props.params;
  const card = getCard(slug);
  if (card == null) notFound();
  const set = getSet(card.setId);
  const setName = set?.name ?? card.setId;
  const numberLabel = cardNumberLabel(card);
  const more = cardsInSet(card.setId, card.slug, 4);
  const details: Array<[string, string]> = [
    ["Set", setName],
    ["Number", numberLabel],
    ["Rarity", card.rarity],
    ["Type", card.types.length > 0 ? card.types.join(", ") : card.supertype],
    ["Stage", card.subtypes.length > 0 ? card.subtypes.join(", ") : card.supertype],
  ];
  if (card.hp != null) details.push(["HP", card.hp]);
  if (card.artist != null) details.push(["Artist", card.artist]);
  if (set != null) details.push(["Series", set.series]);

  return (
    <div className="container py-8 flex flex-col gap-12">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <Link href="/shop" className="hover:text-brand">
          Singles
        </Link>
        <span aria-hidden="true"> / </span>
        {set != null ? (
          <Link href={`/shop?set=${set.slug}`} className="hover:text-brand">
            {set.name}
          </Link>
        ) : null}
      </nav>
      <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="well relative aspect-[5/7] max-w-md mx-auto w-full p-4">
          <Image
            src={card.imageLarge}
            alt={`${card.name} ${numberLabel}`}
            fill
            priority
            sizes="(min-width: 960px) 480px, (min-width: 768px) 40vw, 90vw"
            className="object-contain p-4"
          />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{card.name}</h1>
            <p className="num text-sm text-ink-2">
              {setName} · {numberLabel} · {card.rarity}
            </p>
          </div>
          <CardBuyBox card={card} setName={setName} numberLabel={numberLabel} />
          <div className="notice text-sm">
            <p className="font-semibold">Ships in 1 business day</p>
            <p className="text-ink-2">Sleeved, toploaded, and sent tracked in a bubble mailer. Free tracked shipping on orders over $75. 14-day returns if the condition is off.</p>
          </div>
          <section>
            <h2 className="text-lg font-bold mb-2">Card details</h2>
            <dl className="divided border-y border-line text-sm">
              {details.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-2">
                  <dt className="text-ink-2">{label}</dt>
                  <dd className="num">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
      {more.length > 0 ? (
        <section>
          <SectionHeading title={`More from ${setName}`} href={set != null ? `/shop?set=${set.slug}` : "/shop"} linkLabel="See the set" />
          <TileGrid>
            {more.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </TileGrid>
        </section>
      ) : null}
    </div>
  );
}
