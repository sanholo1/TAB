import React from "react";

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  onSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ search, setSearch, onSearch }) => {
  return (
    <header style={{ display: "flex", gap: "10px", padding: "10px" }}>
      <div style={{ fontWeight: "bold" }}>LOGO</div>

      <input
        type="text"
        value={search}
        placeholder="Szukaj produktu..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={onSearch}>Szukaj</button>

      <div style={{ marginLeft: "auto" }}>
        <button>Profil</button>
        <button>Zaloguj/Wyloguj</button>
      </div>
    </header>
  );
};

export default Header;