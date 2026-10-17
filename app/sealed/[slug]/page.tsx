import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SealedBuyBox } from "@/components/SealedBuyBox";
import { SectionHeading } from "@/components/SectionHeading";
import { SealedTile, TileGrid } from "@/components/Tiles";
import { getSealed, getSet, sealed } from "@/lib/catalog";
import { money, releaseLabel } from "@/lib/format";
import { SEALED_KIND_LABEL } from "@/lib/store";

export function generateStaticParams() {
  return sealed.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<"/sealed/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getSealed(slug);
  if (product == null) return { title: "Product not found" };
  const set = getSet(product.setId);
  const description =
    product.quantity === 0
      ? `${product.name} is sold out.`
      : `${product.name}, factory sealed, ${money(product.price)}. Limit ${product.purchaseLimit} per order.`;
  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, type: "website", images: set != null ? [{ url: set.logo, alt: set.name }] : [] },
  };
}

export default async function SealedProductPage(props: PageProps<"/sealed/[slug]">) {
  const { slug } = await props.params;
  const product = getSealed(slug);
  if (product == null) notFound();
  const set = getSet(product.setId);
  const setName = set?.name ?? product.setId;
  const more = sealed.filter((p) => p.slug !== product.slug && p.quantity > 0).slice(0, 4);
  return (
    <div className="container py-8 flex flex-col gap-12">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-2">
        <Link href="/sealed" className="hover:text-brand">
          Sealed
        </Link>
        <span aria-hidden="true"> / </span>
        {SEALED_KIND_LABEL[product.kind] ?? product.kind}
      </nav>
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <div className="well aspect-[5/7] max-w-md mx-auto w-full flex flex-col items-center justify-center gap-4 p-8">
          {set != null ? <Image src={set.logo} alt="" width={320} height={160} priority sizes="320px" className="w-3/4 h-auto object-contain" /> : null}
          <p className="text-ink-2">{SEALED_KIND_LABEL[product.kind] ?? product.kind}</p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-ink-2">
              Factory sealed · {setName} · Released {releaseLabel(product.releaseDate)}
            </p>
          </div>
          <SealedBuyBox product={product} setName={setName} setLogo={set?.logo ?? null} />
          <div className="notice text-sm">
            <p className="font-semibold">Ships boxed with padding</p>
            <p className="text-ink-2">Sent tracked in 1 business day. Free tracked shipping on orders over $75.</p>
          </div>
          <section>
            <h2 className="text-lg font-bold mb-2">What is inside</h2>
            <ul className="divided border-y border-line text-sm">
              {product.contents.map((item) => (
                <li key={item} className="py-2 num">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      {more.length > 0 ? (
        <section>
          <SectionHeading title="More sealed product" href="/sealed" linkLabel="All sealed" />
          <TileGrid>
            {more.map((p) => (
              <SealedTile key={p.id} product={p} />
            ))}
          </TileGrid>
        </section>
      ) : null}
    </div>
  );
}
