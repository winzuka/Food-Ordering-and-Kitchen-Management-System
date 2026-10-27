import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import MenuCard from "../components/MenuCard";
import { menuService } from "../services/api";
import { isAuthenticated } from "../utils/auth";
import { MenuItem, Category, CartItem } from "../types";


export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchMenuData();

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }
  }, [router]);

  const fetchMenuData = async (): Promise<void> => {
    try {
      setError("");
      console.log("Fetching menu data...");

      const [menuResponse, categoriesResponse] = await Promise.all([
        menuService.getMenuItems(),
        menuService.getCategories(),
      ]);

      // === DEBUG LOGGING ===
      console.log("=== MENU RESPONSE DEBUG ===");
      console.log("Full menuResponse object:", menuResponse);
      console.log("menuResponse.data:", menuResponse.data);
      console.log("categoriesResponse.data:", categoriesResponse.data);

      // Try multiple possible data extraction patterns
      let menuData: MenuItem[] = [];

      // Pattern 1: Direct array
      if (Array.isArray(menuResponse)) {
        menuData = menuResponse;
        console.log("✅ Using menuResponse directly (Pattern 1)");
      }
      // Pattern 2: response.data is array (common in Axios)
      else if (Array.isArray(menuResponse.data)) {
        menuData = menuResponse.data;
        console.log("✅ Using menuResponse.data (Pattern 2)");
      }
      // Pattern 3: menuResponse.data.data is array
      else if (
        menuResponse.data &&
        typeof menuResponse.data === "object" &&
        "data" in menuResponse.data &&
        Array.isArray((menuResponse.data as any).data)
      ) {
        menuData = (menuResponse.data as any).data;
        console.log("✅ Using menuResponse.data.data (Pattern 3)");
      }
      // Pattern 4: menuResponse.data.items is array
      else if (
        menuResponse.data &&
        typeof menuResponse.data === "object" &&
        "items" in menuResponse.data &&
        Array.isArray((menuResponse.data as any).items)
      ) {
        menuData = (menuResponse.data as any).items;
        console.log("✅ Using menuResponse.data.items (Pattern 4)");
      }
      // Pattern 5: Dynamic detection of array property
      else if (menuResponse.data && typeof menuResponse.data === "object") {
        const dataObj = menuResponse.data as any;
        const possibleArrayKeys = Object.keys(dataObj).filter((key) =>
          Array.isArray(dataObj[key])
        );

        if (possibleArrayKeys.length > 0) {
          const firstArrayKey = possibleArrayKeys[0];
          menuData = dataObj[firstArrayKey];
          console.log(
            `✅ Using menuResponse.data.${firstArrayKey} (Pattern 5)`
          );
        }
      }

      // Final validation
      if (!Array.isArray(menuData) || menuData.length === 0) {
        console.warn("❌ No valid menu data found:", menuData);
        setMenuItems([]);
        setCategories([]);
        return;
      }

      setMenuItems(menuData);
      console.log(`✅ Successfully loaded ${menuData.length} menu items`);

      // === Handle Categories ===
      if (Array.isArray(categoriesResponse.data)) {
        const categoryObjects: Category[] = categoriesResponse.data.map(
          (name: any, index: number) => ({
            id: index + 1,
            name: typeof name === "string" ? name : String(name ?? "Unknown"),
          })
        );
        setCategories(categoryObjects);
        console.log("✅ Loaded categories from API:", categoryObjects);
      } else {
        const rawCategories = menuData.map((item) =>
          typeof item.category === "string" ? item.category : null
        );
        const uniqueCategories = Array.from(
          new Set(rawCategories.filter((cat): cat is string => !!cat))
        ).map((name: string, index: number) => ({
          id: index + 1,
          name,
        }));
        setCategories(uniqueCategories);
        console.log(
          "✅ Generated categories from menu items:",
          uniqueCategories
        );
      }
    } catch (error: any) {
      console.error("❌ Error fetching menu data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });
      setError(`Failed to load menu: ${error.message}`);
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem): void => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Item added to cart!");
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading menu...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">
            Choose from our delicious selection of food items
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Make sure your Menu Service is running on port 8082
                </p>
              </div>
              <button onClick={fetchMenuData} className="btn-primary">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Debug Info Section - Commented Out */}
        {/*
        {process.env.NODE_ENV === "development" && !error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Menu Items: {menuItems.length}</p>
            <p>Categories: {categories.length}</p>
            <p>Filtered Items: {filteredItems.length}</p>
            <p>Selected Category: {selectedCategory}</p>
          </div>
        )}
        */}

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-yellow-300 text-red-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((category) => {
              const categoryCount = menuItems.filter(
                (item) => item.category === category.name
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.name
                      ? "bg-yellow-300 text-red-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category.name} ({categoryCount})
                </button>
              );
            })}
          </div>
        )}

        {cart.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">
                {cart.length} item(s) in cart
              </span>
              <button
                onClick={() => router.push("/cart")}
                className="btn-primary"
              >
                View Cart
              </button>
            </div>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === "all"
                ? "There are no menu items available at the moment."
                : `No items found in the "${selectedCategory}" category.`}
            </p>
            <div className="space-x-3">
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="btn-secondary"
                >
                  View All Items
                </button>
              )}
              <button onClick={fetchMenuData} className="btn-primary">
                Refresh Menu
              </button>
            </div>
          </div>
        )}

        {!error && menuItems.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Menu Service Status
                </h3>
                <p className="text-sm text-yellow-700">
                  Connected to Menu Service, but no menu items found in
                  database.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
