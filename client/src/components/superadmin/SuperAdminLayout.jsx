import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Store,
  Percent,
  Zap,
  Wallet,
  MessageSquareWarning,
  Settings,
  ArrowLeft,
  Crown,
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/superadmin', label: 'Business Intelligence', icon: LayoutDashboard, end: true },
    { to: '/superadmin/shops', label: 'Shop Approvals (KYC)', icon: Store },
    { to: '/superadmin/commission', label: 'Commission Rates', icon: Percent },
    { to: '/superadmin/boosts', label: 'Boost Campaigns', icon: Zap },
    { to: '/superadmin/payouts', label: 'Payout Ledger', icon: Wallet },
    { to: '/superadmin/disputes', label: 'Dispute Resolution', icon: MessageSquareWarning },
    { to: '/superadmin/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-amazon-blue text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-gray-700 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amazon-yellow" />
            <span className="font-extrabold text-lg tracking-wide text-white">
              Business <span className="text-amazon-orange text-xs">Owner</span>
            </span>
          </div>

          <div className="px-5 py-4 border-b border-gray-800 bg-amazon-light_blue text-xs">
            <div className="font-bold text-gray-200 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[11px] text-amazon-yellow font-medium uppercase mt-0.5">
              SUPER ADMIN
            </div>
          </div>

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

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-lg border border-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
