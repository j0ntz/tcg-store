"use client";

interface Props {
  id: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export const QuantityInput: React.FC<Props> = (props) => {
  const options = Array.from({ length: Math.max(1, props.max) }, (_, i) => i + 1);
  return (
    <select id={props.id} className="input num w-20" value={props.value} onChange={(event) => props.onChange(Number(event.target.value))} aria-label="Quantity">
      {options.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
};
