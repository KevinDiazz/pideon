import { useState } from "react";
import { Shield, Package, FolderTree, ClipboardList } from "lucide-react";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";

const tabs = [
  { key: "orders", label: "Pedidos", Icon: ClipboardList },
  { key: "products", label: "Productos", Icon: Package },
  { key: "categories", label: "Categorías", Icon: FolderTree },
];

const Admin = () => {
  const [active, setActive] = useState("orders");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-red-600" size={28} />
        <h2 className="text-2xl md:text-3xl font-black text-amber-900">
          Panel de administración
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-orange-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 font-semibold -mb-px border-b-2 transition ${
              active === t.key
                ? "border-orange-600 text-orange-700"
                : "border-transparent text-amber-900/70 hover:text-orange-600"
            }`}
          >
            <t.Icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {active === "orders" && <AdminOrders />}
      {active === "products" && <AdminProducts />}
      {active === "categories" && <AdminCategories />}
    </div>
  );
};

export default Admin;
