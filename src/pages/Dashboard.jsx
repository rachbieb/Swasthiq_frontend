import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  Boxes,
  ClipboardList,
  ReceiptText,
  Search,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import Inventory from "./Inventory";

const salesRows = [
  "MEDICINE NAME",
  "GENERIC NAME",
  "BATCH NO",
  "EXPIRY DATE",
  "QUANTITY",
  "MRP / PRICE",
  "SUPPLIER",
  "STATUS",
  "ACTIONS",
];

const tabItems = [
  { id: "sales", label: "Sales", icon: ReceiptText },
  { id: "purchase", label: "Purchase", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Boxes },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }
  return dateString;
}

function SalesPanel() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6">
      <h2 className="text-2xl font-semibold text-slate-900">Make a Sale</h2>
      <p className="mt-1 text-lg text-slate-500">Select medicines from inventory</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Patient Id"
          className="h-12 rounded-2xl border border-slate-200 px-4 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 md:w-56"
        />
        <div className="flex h-12 min-w-[280px] flex-1 items-center rounded-2xl border border-slate-200 px-4 focus-within:border-blue-400">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            className="ml-3 w-full border-none bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          className="h-12 rounded-2xl bg-green-500 px-6 text-base font-semibold text-white"
        >
          Enter
        </button>
        <button
          type="button"
          className="h-12 rounded-2xl bg-red-500 px-6 text-base font-semibold text-white"
        >
          Bill
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm font-semibold tracking-wide text-slate-500">
              {salesRows.map((name) => (
                <th key={name} className="pb-3 pl-4 pr-2">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-2xl text-slate-500">
                No medicines added yet. Search and add medicines above.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PurchasePanel({ purchaseValue }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8">
      <div className="flex items-center gap-3 text-slate-900">
        <ClipboardList size={20} />
        <h2 className="text-2xl font-semibold">Purchase Orders</h2>
      </div>
      <p className="mt-4 text-lg text-slate-500">Total purchase value from API:</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(purchaseValue)}</p>
    </section>
  );
}

function InventoryPanel({ openCreateSignal }) {
  return <Inventory openCreateSignal={openCreateSignal} />;
}

function RecentSales({ sales, loading }) {
  return (
    <section>
      <h2 className="text-3xl font-semibold text-slate-900">Recent Sales</h2>
      <div className="mt-5 space-y-4">
        {loading ? (
          <article className="rounded-3xl border border-slate-200 bg-white px-6 py-6 text-slate-500">
            Loading recent sales...
          </article>
        ) : sales.length === 0 ? (
          <article className="rounded-3xl border border-slate-200 bg-white px-6 py-6 text-slate-500">
            No recent sales yet.
          </article>
        ) : (
          sales.map((sale) => (
            <article
              key={sale.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <Box size={20} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">INV-{sale.id}</p>
                  <p className="text-base text-slate-500">
                    {sale.medicineName} | {sale.quantitySold} items
                  </p>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-semibold text-slate-900">{formatCurrency(sale.totalPrice)}</p>
                <p className="text-base text-slate-500">{formatDate(sale.date)}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-4 py-1 text-base font-medium text-emerald-700">
                Completed
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sales");
  const [openCreateSignal, setOpenCreateSignal] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [stats, setStats] = useState({
    todaySales: 0,
    itemsSold: 0,
    lowStockCount: 0,
    purchaseValue: 0,
  });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError("");

      try {
        const [
          salesSummaryRes,
          itemsSoldRes,
          lowStockRes,
          purchaseSummaryRes,
          recentSalesRes,
          inventoryRes,
        ] = await Promise.all([
          API.get("/dashboard/sales-summary"),
          API.get("/dashboard/items-sold"),
          API.get("/dashboard/low-stock"),
          API.get("/dashboard/purchase-summary"),
          API.get("/dashboard/recent-sales"),
          API.get("/inventory/"),
        ]);

        const lowStockList = Array.isArray(lowStockRes.data) ? lowStockRes.data : [];
        const inventoryList = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
        const recentSalesList = Array.isArray(recentSalesRes.data) ? recentSalesRes.data : [];

        const medicineById = inventoryList.reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {});

        setStats({
          todaySales: Number(salesSummaryRes.data?.today_sales || 0),
          itemsSold: Number(itemsSoldRes.data?.items_sold || 0),
          lowStockCount: lowStockList.length,
          purchaseValue: Number(purchaseSummaryRes.data?.total_purchase_value || 0),
        });

        setRecentSales(
          recentSalesList.map((sale) => ({
            id: sale.id,
            medicineName: medicineById[sale.medicine_id] || `Medicine #${sale.medicine_id}`,
            quantitySold: sale.quantity_sold,
            totalPrice: Number(sale.total_price || 0),
            date: sale.date,
          })),
        );
      } catch {
        setDashboardError("Failed to load dashboard data from backend.");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activePanel = useMemo(() => {
    if (activeTab === "purchase") {
      return <PurchasePanel purchaseValue={stats.purchaseValue} />;
    }
    if (activeTab === "inventory") {
      return <InventoryPanel openCreateSignal={openCreateSignal} />;
    }
    return <SalesPanel />;
  }, [activeTab, openCreateSignal, stats.purchaseValue]);

  const handleHeaderAddMedicine = () => {
    setActiveTab("inventory");
    setOpenCreateSignal((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 px-6 py-6 lg:px-8">
        <Header onAddMedicine={handleHeaderAddMedicine} />

        {dashboardError ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {dashboardError}
          </p>
        ) : null}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Today's Sales"
            value={dashboardLoading ? "..." : formatCurrency(stats.todaySales)}
            color="bg-emerald-100"
            chip="Live"
            icon={<Wallet size={26} className="text-emerald-600" />}
          />
          <Card
            title="Items Sold Today"
            value={dashboardLoading ? "..." : String(stats.itemsSold)}
            color="bg-blue-100"
            chip={`${recentSales.length} Orders`}
            icon={<ShoppingCart size={26} className="text-blue-600" />}
          />
          <Card
            title="Low Stock Items"
            value={dashboardLoading ? "..." : String(stats.lowStockCount)}
            color="bg-orange-100"
            chip={stats.lowStockCount > 0 ? "Action Needed" : "No Alerts"}
            icon={<AlertTriangle size={26} className="text-orange-600" />}
          />
          <Card
            title="Purchase Orders"
            value={dashboardLoading ? "..." : formatCurrency(stats.purchaseValue)}
            color="bg-violet-100"
            chip="Summary"
            icon={<Box size={26} className="text-violet-600" />}
          />
        </section>

        <section className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center rounded-xl px-5 py-3 text-lg font-medium transition ${
                  tab.id === activeTab
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-2xl bg-green-500 px-6 py-3 text-lg font-semibold text-white"
            >
              + New Sale
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-lg font-semibold text-slate-900"
            >
              + New Purchase
            </button>
          </div>
        </section>

        <div className="mt-5">{activePanel}</div>

        <div className="mt-7">
          <RecentSales sales={recentSales} loading={dashboardLoading} />
        </div>
      </main>
    </div>
  );
}
