import { Download, Plus } from "lucide-react";

export default function Header({ onAddMedicine }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Pharmacy CRM</h1>
        <p className="mt-1 text-xl text-slate-500">
          Manage inventory, sales, and purchase orders
        </p>
      </div>

      <div className="flex gap-3 self-center">
        <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-lg font-medium text-slate-900">
          <Download size={18} />
          Export
        </button>
        <button
          type="button"
          onClick={onAddMedicine}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-lg font-medium text-white"
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>
    </div>
  );
}
