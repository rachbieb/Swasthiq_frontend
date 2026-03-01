import {
  Activity,
  Boxes,
  CheckSquare,
  Grid2x2,
  Link2,
  List,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const topItems = [
    { icon: Search, active: false, label: "Search" },
    { icon: Grid2x2, active: true, label: "Dashboard" },
    { icon: List, active: false, label: "List" },
    { icon: Activity, active: false, label: "Pulse" },
    { icon: Boxes, active: false, label: "Inventory" },
    { icon: Users, active: false, label: "Users" },
    { icon: CheckSquare, active: false, label: "Tasks" },
    { icon: Link2, active: false, label: "Links" },
    { icon: Plus, active: false, label: "Add" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-20 flex-col items-center border-r border-slate-200 bg-white py-6">
      <div className="flex flex-1 flex-col items-center gap-3">
        {topItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              type="button"
              key={item.label}
              className={`grid h-11 w-11 place-items-center rounded-2xl transition ${
                item.active
                ? "bg-blue-100 text-blue-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              aria-label={item.label}
            >
              <IconComponent size={20} />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>
    </aside>
  );
}