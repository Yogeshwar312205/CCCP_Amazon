import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Boxes,
  RotateCcw,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Users,
  FileText,
  Settings,
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/admin', label: 'Dashboard & Analytics', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products Management', icon: Package },
    { to: '/admin/categories', label: 'Categories Management', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
    { to: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ to: '/admin/coupons', label: 'Coupons & Promos', icon: Tag });
    navItems.push({ to: '/admin/admins', label: 'Admin Management', icon: Users });
    navItems.push({ to: '/admin/audit-logs', label: 'Audit Logs (Root)', icon: FileText });
    navItems.push({ to: '/admin/settings', label: 'Store Settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-amazon-blue text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand / Logo */}
          <div className="p-5 border-b border-gray-700 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amazon-yellow" />
              <span className="font-extrabold text-lg tracking-wide text-white">
                CCCP <span className="text-amazon-orange text-xs">ADMIN</span>
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-5 py-4 border-b border-gray-800 bg-amazon-light_blue text-xs">
            <div className="font-bold text-gray-200 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] text-amazon-yellow font-medium uppercase mt-0.5">
              {user?.role} Access
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amazon-yellow text-gray-900 shadow'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Link: Return to Store */}
        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-lg border border-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
