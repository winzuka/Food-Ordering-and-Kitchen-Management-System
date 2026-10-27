import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { userService } from "../services/api";
import { isAuthenticated, getUser, setUser } from "../utils/auth";
import { User } from "../types";

interface ProfileFormData {
  username: string;
  email: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Load user data
    const user = getUser();
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setIsMounted(true);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await userService.updateProfile(formData);
      const updatedUser = response.data;

      // Update user in cookies
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
  <div className="max-w-2xl mx-auto space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in-0 slide-in-from-top-4 duration-700">
      <h1 className="text-2xl font-bold text-gray-900 font-poppins">Profile Settings</h1>
      <p className="text-gray-700 mt-1 font-poppins">
        Update your personal information and delivery preferences
      </p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-800 font-poppins mb-2"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 focus:shadow-lg font-poppins"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800 font-poppins mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 focus:shadow-lg font-poppins"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-800 font-poppins mb-2"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 focus:shadow-lg font-poppins"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-semibold text-gray-800 font-poppins mb-2"
          >
            Default Delivery Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 focus:shadow-lg font-poppins resize-none"
            placeholder="Enter your default delivery address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm font-poppins">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm font-poppins">
            {success}
          </div>
        )}

        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95 font-semibold font-poppins"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-lg font-semibold font-poppins transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>

    {/* Account Info */}
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 delay-400">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 font-poppins">
        Account Information
      </h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="bg-gray-50 p-4 rounded-xl">
          <dt className="text-sm font-semibold text-gray-600 font-poppins">
            Account Type
          </dt>
          <dd className="mt-2 text-base font-medium text-gray-900 capitalize font-poppins">
            {isMounted ? (currentUser?.role?.toLowerCase() || "Customer") : "Loading..."}
          </dd>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <dt className="text-sm font-semibold text-gray-600 font-poppins">
            Member Since
          </dt>
          <dd className="mt-2 text-base font-medium text-gray-900 font-poppins">
            {isMounted && currentUser?.createdAt
              ? new Date(currentUser.createdAt).toLocaleDateString()
              : "N/A"}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</Layout>
  );
}
