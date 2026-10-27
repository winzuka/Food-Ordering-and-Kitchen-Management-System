// components/admin/EditMenuItemModal.tsx
import { useState, useEffect } from "react";
import { MenuItem } from "../../types";

interface EditMenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => void;
}

export default function EditMenuItemModal({
  item,
  onClose,
  onSave,
}: EditMenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pizza",
    imageUrl: "",
    available: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = ["Pizza", "Burgers", "Salads", "Beverages", "Sides"];

  // Enhanced useEffect to properly populate form data
  useEffect(() => {
    console.log("EditMenuItemModal - Item received:", item);

    if (item) {
      const populatedData = {
        name: item.name || "",
        description: item.description || "",
        price: item.price ? item.price.toString() : "",
        category: item.category || "Pizza",
        imageUrl: item.imageUrl || "",
        available: item.available !== undefined ? item.available : true,
      };

      console.log("EditMenuItemModal - Populating form with:", populatedData);
      setFormData(populatedData);
      setImagePreview(item.imageUrl || "");
    }
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 5MB" });
        return;
      }

      setSelectedFile(file);
      setErrors({ ...errors, image: "" });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price = "Valid price is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (selectedFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(selectedFile);
        setUploadingImage(false);
      }

      // Submit the form
      await onSave({
        ...formData,
        price: Number(formData.price),
        imageUrl,
      });
    } catch (error) {
      console.error("Error saving menu item:", error);
      setErrors({ ...errors, submit: "Failed to save menu item" });
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleCancel = () => {
    // Reset form data when canceling
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price ? item.price.toString() : "",
        category: item.category || "Pizza",
        imageUrl: item.imageUrl || "",
        available: item.available !== undefined ? item.available : true,
      });
      setImagePreview(item.imageUrl || "");
    }
    setSelectedFile(null);
    setErrors({});
    onClose();
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    handleInputChange("imageUrl", "");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Menu Item</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Current Item Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Editing:</strong> {item.name}
              <span className="text-blue-600 ml-2">(ID: {item.id})</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter item name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 transition-colors ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter item description"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 transition-colors ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 transition-colors"
                disabled={isLoading}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Item Image
              </label>

              {/* Current Image Preview */}
              {imagePreview && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Current image"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFile ? "New image selected" : "Current image"}
                  </p>
                </div>
              )}

              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="image-upload"
                  className={`w-full px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2 h-32 ${
                    errors.image
                      ? "border-red-500"
                      : "border-gray-300 hover:border-blue-400"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </label>
              </div>

              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}

              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Available */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) =>
                  handleInputChange("available", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                Available for order
              </label>
            </div>

            {/* Form Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Summary:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Name:</strong> {formData.name || "Not set"}
                </p>
                <p>
                  <strong>Price:</strong> ${formData.price || "0.00"}
                </p>
                <p>
                  <strong>Category:</strong> {formData.category}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {formData.available ? "Available" : "Out of stock"}
                </p>
                <p>
                  <strong>Image:</strong>{" "}
                  {selectedFile
                    ? "New image selected"
                    : imagePreview
                    ? "Current image"
                    : "No image"}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold font-poppins"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold font-poppins"
                disabled={isLoading || uploadingImage}
              >
                {uploadingImage
                  ? "Uploading..."
                  : isLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
