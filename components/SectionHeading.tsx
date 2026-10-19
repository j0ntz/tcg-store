import Link from "next/link";

export const SectionHeading: React.FC<{ title: string; href?: string; linkLabel?: string }> = (props) => {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-4">
      <h2 className="text-lg font-bold">{props.title}</h2>
      {props.href != null ? (
        <Link href={props.href} className="text-sm font-medium text-brand no-underline hover:underline">
          {props.linkLabel ?? "See all"}
        </Link>
      ) : null}
    </div>
  );
};
