import React from "react";

interface Props {
  selectedPrice: string | null;
  setSelectedPrice: (price: string | null) => void;
}

const PriceFilter: React.FC<Props> = ({ selectedPrice, setSelectedPrice }) => {
  const options = [
    { label: "do 50 zł", value: "low" },
    { label: "50-200 zł", value: "mid" },
    { label: "powyżej 200 zł", value: "high" },
  ];

  return (
    <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={selectedPrice === opt.value ? "active" : ""}
          onClick={() =>
            setSelectedPrice(selectedPrice === opt.value ? null : opt.value)
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default PriceFilter;