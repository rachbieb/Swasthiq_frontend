import { useEffect, useState } from "react";
import API from "../services/api";

const sampleInventory = [
  {
    id: 1,
    name: "Paracetamol",
    category: "Tablet",
    batch_no: "PCM123",
    expiry_date: "2026-05-10",
    quantity: 50,
    price: 10.5,
    status: "Active",
  },
  {
    id: 2,
    name: "Crocin",
    category: "Tablet",
    batch_no: "CRC456",
    expiry_date: "2024-01-01",
    quantity: 5,
    price: 8.0,
    status: "Low Stock",
  },
];

const initialForm = {
  name: "",
  category: "",
  batch_no: "",
  expiry_date: "",
  quantity: "",
  price: "",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function getStatusClasses(status) {
  if (status === "Low Stock") {
    return "bg-amber-100 text-amber-700";
  }
  if (status === "Out of Stock") {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

export default function Inventory({ openCreateSignal = 0 }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await API.get("/inventory/");
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : sampleInventory;
      setMedicines(data);
      setError("");
    } catch {
      setError("Failed to load inventory from API. Showing sample data.");
      setMedicines(sampleInventory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (openCreateSignal > 0) {
      setFormMode("add");
      setEditingId(null);
      setFormData(initialForm);
      setFormError("");
      setFormOpen(true);
    }
  }, [openCreateSignal]);

  const openAddForm = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(initialForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (medicine) => {
    setFormMode("edit");
    setEditingId(medicine.id);
    setFormData({
      name: medicine.name || "",
      category: medicine.category || "",
      batch_no: medicine.batch_no || "",
      expiry_date: medicine.expiry_date || "",
      quantity: String(medicine.quantity ?? ""),
      price: String(medicine.price ?? ""),
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) {
      return;
    }
    setFormOpen(false);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.batch_no.trim() ||
      !formData.expiry_date ||
      formData.quantity === "" ||
      formData.price === ""
    ) {
      return "All fields are required.";
    }
    if (Number(formData.quantity) < 0 || Number(formData.price) < 0) {
      return "Quantity and price must be non-negative.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      batch_no: formData.batch_no.trim(),
      expiry_date: formData.expiry_date,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
    };

    try {
      setSubmitting(true);
      setFormError("");

      if (formMode === "edit" && editingId !== null) {
        await API.put(`/inventory/${editingId}`, payload);
        setSuccessMessage("Medicine updated successfully.");
      } else {
        await API.post("/inventory/", payload);
        setSuccessMessage("Medicine added successfully.");
      }

      setFormOpen(false);
      await fetchInventory({ showLoading: false });
    } catch {
      setFormError("Failed to save medicine. Please check backend logs and input values.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
          <p className="mt-1 text-slate-500">Medicine stock synced from your backend</p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Medicine
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm font-semibold tracking-wide text-slate-500">
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Batch No</th>
              <th className="px-3 py-3">Expiry Date</th>
              <th className="px-3 py-3">Quantity</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  Loading inventory...
                </td>
              </tr>
            ) : (
              medicines.map((med) => (
                <tr key={med.id} className="border-b border-slate-100">
                  <td className="px-3 py-4 text-slate-900">{med.name}</td>
                  <td className="px-3 py-4 text-slate-700">{med.category}</td>
                  <td className="px-3 py-4 text-slate-700">{med.batch_no}</td>
                  <td className="px-3 py-4 text-slate-700">{med.expiry_date}</td>
                  <td className="px-3 py-4 text-slate-700">{med.quantity}</td>
                  <td className="px-3 py-4 text-slate-700">{formatCurrency(med.price)}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        med.status,
                      )}`}
                    >
                      {med.status}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(med)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {formMode === "edit" ? "Update Medicine" : "Add Medicine"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  placeholder="Dolo 650"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Category
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  placeholder="Tablet"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Batch No
                <input
                  name="batch_no"
                  value={formData.batch_no}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  placeholder="DL650"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Expiry Date
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Quantity
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  placeholder="30"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3"
                  placeholder="12.0"
                />
              </label>

              {formError ? (
                <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {formError}
                </p>
              ) : null}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {submitting
                    ? "Saving..."
                    : formMode === "edit"
                      ? "Update Medicine"
                      : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
