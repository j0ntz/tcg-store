import Link from "next/link";

export const AddedNotice: React.FC<{ name: string }> = (props) => {
  return (
    <p className="text-sm" role="status">
      Added {props.name} to your cart.{" "}
      <Link href="/cart" className="font-medium text-brand">
        View cart
      </Link>
    </p>
  );
};
