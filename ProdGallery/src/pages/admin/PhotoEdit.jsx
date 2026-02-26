import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { photosAPI, categoriesAPI } from "../../services/api";
import { resolveImageUrl } from "../../utils/image";

export default function AdminPhotoEdit() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    image: null,
    currentImage: "", // Store current image URL
    photographer: "",
    width: "",
    height: "",
    featured: false,
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [photoResponse, categoriesResponse] = await Promise.all([
          photosAPI.getById(photoId),
          categoriesAPI.getAll(),
        ]);

        setFormData({
          title: photoResponse.title || "",
          description: photoResponse.description || "",
          category_id: photoResponse.category_id || "",
          price: photoResponse.price || "",
          image: null,
          currentImage: photoResponse.image || "",
          photographer: photoResponse.photographer || "",
          width: photoResponse.width || "",
          height: photoResponse.height || "",
          featured: photoResponse.featured || false,
          is_active: photoResponse.is_active !== false,
        });
        setImagePreview(photoResponse.image ? resolveImageUrl(photoResponse.image) : null);

        setCategories(categoriesResponse || []);
      } catch (err) {
        setError(err.message || "Failed to load photo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [photoId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.category_id || !formData.price) {
      setError("Title, category, and price are required.");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category_id', formData.category_id);
      data.append('price', parseFloat(formData.price));
      if (formData.image) data.append('image', formData.image); // Only append if new image selected
      data.append('photographer', formData.photographer);
      if (formData.width) data.append('width', parseInt(formData.width, 10));
      if (formData.height) data.append('height', parseInt(formData.height, 10));
      data.append('featured', formData.featured ? '1' : '0');
      data.append('is_active', formData.is_active ? '1' : '0');

      await photosAPI.update(photoId, data);
      navigate("/admin/photos");
    } catch (err) {
      setError(err.message || "Failed to update photo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={`field-${index}`} className="space-y-2">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-end gap-3">
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Photo</h1>
          <p className="text-gray-600 mt-2">Update photo details</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              <p className="text-gray-500 text-sm mt-1">Leave empty to keep current image. Supported formats: JPEG, PNG, GIF (Max 5MB)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photographer</label>
              <input
                type="text"
                name="photographer"
                value={formData.photographer}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">Current Image:</p>
              <img
                src={imagePreview}
                alt="Current"
                className="max-h-64 max-w-full mx-auto rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/photos")}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              {loading ? "Saving..." : "Update Photo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
