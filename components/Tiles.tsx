import Image from "next/image";
import Link from "next/link";
import { cardNumberLabel, cheapestInStock, getSet, type CatalogCard, type CatalogSet, type SealedProduct } from "@/lib/catalog";
import { money, releaseLabel, stockPhrase } from "@/lib/format";
import { SEALED_KIND_LABEL, conditionName } from "@/lib/store";

export const TileGrid: React.FC<{ children: React.ReactNode; wide?: boolean }> = (props) => {
  const cols = props.wide === true ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  return <ul className={`grid gap-x-4 gap-y-6 ${cols}`}>{props.children}</ul>;
};

export const CardTile: React.FC<{ card: CatalogCard; isNew?: boolean; phoneHidden?: boolean }> = (props) => {
  const { card } = props;
  const best = cheapestInStock(card);
  const set = getSet(card.setId);
  // Phones get a shorter row so the set and sealed sections stay within one or two swipes.
  return (
    <li className={props.phoneHidden === true ? "hidden sm:block" : undefined}>
      <Link href={`/cards/${card.slug}`} className="tile">
        <div className="well relative aspect-[5/7] p-3">
          <Image
            src={card.imageSmall}
            alt={`${card.name} ${cardNumberLabel(card)}`}
            fill
            sizes="(min-width: 960px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-2"
          />
          {props.isNew === true ? (
            <span className="absolute top-2 left-2 chip chip-active h-6 px-2 text-xs font-medium">New</span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <span className="tile-name font-semibold leading-tight">{card.name}</span>
          <span className="num text-xs text-ink-2">
            {set?.name ?? card.setId} · {cardNumberLabel(card)}
          </span>
          {best == null ? (
            <span className="text-sm text-ink-3">Sold out</span>
          ) : (
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className="num font-display font-bold text-lg">{money(best.price)}</span>
              <span className="text-xs text-ink-2">
                {conditionName(best.condition)} · {stockPhrase(best.quantity)}
              </span>
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};

export const SealedTile: React.FC<{ product: SealedProduct }> = (props) => {
  const { product } = props;
  const set = getSet(product.setId);
  return (
    <li>
      <Link href={`/sealed/${product.slug}`} className="tile">
        <div className="well relative aspect-[5/7] flex flex-col items-center justify-center gap-3 p-4">
          {set != null ? (
            <Image src={set.logo} alt="" width={160} height={80} sizes="200px" className="w-4/5 h-auto object-contain" />
          ) : null}
          <span className="text-sm text-ink-2 text-center">{SEALED_KIND_LABEL[product.kind] ?? product.kind}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="tile-name font-semibold leading-tight">{product.name}</span>
          <span className="text-xs text-ink-2">{product.contents[0]}</span>
          {product.quantity === 0 ? (
            <span className="text-sm text-ink-3">Sold out</span>
          ) : (
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className="num font-display font-bold text-lg">{money(product.price)}</span>
              <span className="text-xs text-ink-2">{stockPhrase(product.quantity)}</span>
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};

export const SetTile: React.FC<{ set: CatalogSet }> = (props) => {
  const { set } = props;
  return (
    <li>
      <Link href={`/shop?set=${set.slug}`} className="tile">
        <div className="well relative aspect-[5/3] flex items-center justify-center p-4">
          <Image src={set.logo} alt="" width={200} height={90} sizes="240px" className="w-4/5 h-auto object-contain" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="tile-name font-semibold leading-tight">{set.name}</span>
          <span className="num text-xs text-ink-2">
            Released {releaseLabel(set.releaseDate)} · {set.singlesCount} singles
          </span>
        </div>
      </Link>
    </li>
  );
};
