import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductsPage from "./products/ProductsPage";
import ProductDetailPage from "./products/ProductDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />


        {/* Tymczasowe przekierowanie na stronę główną*/}
        <Route path="/" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
