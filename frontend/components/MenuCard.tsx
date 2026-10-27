import { useState } from "react";
import { MenuCardProps } from "../types";

export default function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (): void => {
    onAddToCart(item);
  };

  const handleImageError = () => {
    console.log("Image failed to load:", item.imageUrl);
    setImageError(true);
  };

  // Default fallback image path
  const fallbackImage = "/images/menu/default-food.jpg";

  // Use image from database, or fallback
  const imageSrc = imageError ? fallbackImage : item.imageUrl || fallbackImage;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <div className="relative h-48 mb-6 bg-gray-200 rounded-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
        {/* Using regular HTML img instead of Next.js Image */}
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={handleImageError}
          onLoad={() => console.log("Image loaded successfully:", imageSrc)}
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-in fade-in-0 duration-300">
            <span className="text-white font-semibold font-poppins">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-300">
          <h3 className="text-xl font-semibold text-gray-900 font-poppins">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm font-poppins leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between py-2 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-400">
          <span className="text-2xl font-bold text-green-600 font-poppins">
            ${item.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full font-medium font-poppins">
            {item.category}
          </span>
        </div>

        <div className="pt-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`w-full py-3 px-6 rounded-lg font-semibold font-poppins transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              item.available
                ? "bg-yellow-300 text-red-600 hover:bg-gray-800 hover:scale-105 active:scale-95 focus:ring-black shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}
          >
            {item.available ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01"
                  />
                </svg>
                <span>Add to Cart</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12"
                  />
                </svg>
                <span>Out of Stock</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
