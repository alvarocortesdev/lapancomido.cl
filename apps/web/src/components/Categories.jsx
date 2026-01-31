// frontend/src/components/Categories.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/categories`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        const data = await response.json();

        // Se almacena el valor original de la categoría (por ejemplo, en minúsculas)
        setCategories(data.map((item) => item.category));
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  // Función para capitalizar la primera letra de cada palabra
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleCategoryClick = (category) => {
    // Navega a /catalog con el parámetro category y elimina cualquier search previo.
    navigate(`/catalog?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="my-4 sm:my-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 pt-2 sm:pt-4 pb-2 sm:pb-4 rounded-[30px] w-full">
        {categories.map((category) => (
          <div
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="cursor-pointer p-3 sm:p-4 bg-[#F5E1A4] rounded-full flex justify-center items-center text-center font-semibold text-sm sm:text-base hover:bg-[#e6d294] transition-colors"
          >
            {capitalizeWords(category)}
          </div>
        ))}
      </div>
    </section>
  );
};
