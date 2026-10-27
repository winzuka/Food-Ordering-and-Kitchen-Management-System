// pages/admin/menu.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import AdminMenuTable from "../../components/admin/AdminMenuTable";
import AddMenuItemModal from "../../components/admin/AddMenuItemModal";
import EditMenuItemModal from "../../components/admin/EditMenuItemModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { menuService } from "../../services/api";
import { isAuthenticated, isAdmin } from "../../utils/auth";
import { MenuItem } from "../../types";

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/");
      return;
    }

    fetchMenuItems();
  }, [router]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenuItems();
      setMenuItems(response.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load menu items");
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData: Partial<MenuItem>) => {
    try {
      const response = await menuService.createMenuItem(itemData);
      setMenuItems([...menuItems, response.data]);
      setShowAddModal(false);
      alert("Menu item added successfully!");
    } catch (err: any) {
      console.error("Error adding menu item:", err);
      alert("Failed to add menu item");
    }
  };

  const handleEditItem = async (itemData: Partial<MenuItem>) => {
    if (!selectedItem) return;

    try {
      const response = await menuService.updateMenuItem(
        selectedItem.id,
        itemData
      );
      setMenuItems(
        menuItems.map((item) =>
          item.id === selectedItem.id ? response.data : item
        )
      );
      setShowEditModal(false);
      setSelectedItem(null);
      alert("Menu item updated successfully!");
    } catch (err: any) {
      console.error("Error updating menu item:", err);
      alert("Failed to update menu item");
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await menuService.deleteMenuItem(selectedItem.id);
      setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      alert("Menu item deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting menu item:", err);
      alert("Failed to delete menu item");
    }
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const openDeleteModal = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white min-h-screen p-6">
          <div className="text-lg text-gray-800 font-poppins bg-white p-8 rounded-2xl shadow-lg">
            Loading menu items...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in-0 slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">
              Menu Management
            </h1>
            <p className="text-gray-700 font-poppins">Manage your restaurant's menu items</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg font-semibold font-poppins transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Add New Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
            <p className="text-red-600 font-poppins">{error}</p>
          </div>
        )}

        {/* Menu Items Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
          <AdminMenuTable
            menuItems={menuItems}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddMenuItemModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
          />
        )}

        {showEditModal && selectedItem && (
          <EditMenuItemModal
            item={selectedItem}
            onClose={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
            onSave={handleEditItem}
          />
        )}

        {showDeleteModal && selectedItem && (
          <DeleteConfirmModal
            item={selectedItem}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedItem(null);
            }}
            onConfirm={handleDeleteItem}
          />
        )}
      </div>
    </Layout>
  );
}