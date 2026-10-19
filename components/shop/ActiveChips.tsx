import Link from "next/link";
import { activeFilterCount, getSetBySlug, shopHref, type ShopQuery } from "@/lib/catalog";
import { conditionName } from "@/lib/store";

interface Chip {
  label: string;
  href: string;
}

export const ActiveChips: React.FC<{ query: ShopQuery }> = (props) => {
  const { query } = props;
  if (activeFilterCount(query) === 0 && query.q === "") return null;
  const chips: Chip[] = [];
  if (query.q !== "") chips.push({ label: `“${query.q}”`, href: shopHref({ ...query, q: "", page: 1 }) });
  for (const slug of query.set) {
    chips.push({ label: getSetBySlug(slug)?.name ?? slug, href: shopHref({ ...query, set: query.set.filter((s) => s !== slug), page: 1 }) });
  }
  for (const rarity of query.rarity) {
    chips.push({ label: rarity, href: shopHref({ ...query, rarity: query.rarity.filter((r) => r !== rarity), page: 1 }) });
  }
  for (const type of query.type) {
    chips.push({ label: type, href: shopHref({ ...query, type: query.type.filter((t) => t !== type), page: 1 }) });
  }
  for (const cond of query.cond) {
    chips.push({ label: conditionName(cond), href: shopHref({ ...query, cond: query.cond.filter((c) => c !== cond), page: 1 }) });
  }
  if (query.min != null) chips.push({ label: `Min $${query.min}`, href: shopHref({ ...query, min: null, page: 1 }) });
  if (query.max != null) chips.push({ label: `Max $${query.max}`, href: shopHref({ ...query, max: null, page: 1 }) });
  if (!query.instock) chips.push({ label: "Including sold out", href: shopHref({ ...query, instock: true, page: 1 }) });
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link href={chip.href} className="chip chip-active" aria-label={`Remove ${chip.label}`}>
            {chip.label}
            <span aria-hidden="true">×</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={shopHref({ sort: query.sort })} className="chip">
          Clear all
        </Link>
      </li>
    </ul>
  );
};
