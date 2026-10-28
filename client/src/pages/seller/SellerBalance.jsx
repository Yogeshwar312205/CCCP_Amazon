import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, Lock, CheckCircle, ArrowDownCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const SellerBalance = () => {
  const token = useSelector((state) => state.auth.token);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/seller/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setBalance(r.data.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  const escrow = parseFloat(balance?.escrowBalance || 0);
  const available = parseFloat(balance?.availableBalance || 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Wallet className="w-7 h-7 text-amazon-orange" />
        Balance & Payouts
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Escrow */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-semibold text-gray-600">In Escrow (Locked)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${escrow.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Funds from recent orders — locked during customer return window.
            Released automatically after the return period expires.
          </p>
        </div>

        {/* Available */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-semibold text-gray-600">Available for Withdrawal</span>
          </div>
          <p className="text-3xl font-bold text-green-700">${available.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Cleared funds ready for bank disbursement.
            Request a payout and the platform admin will process it.
          </p>
        </div>
      </div>

      {available > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-green-800">Ready to withdraw ${available.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-0.5">
              Contact support or use the withdrawal request feature to initiate a bank transfer.
            </p>
          </div>
          <ArrowDownCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
        </div>
      )}

      {escrow === 0 && available === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>No balance yet. Start fulfilling orders to earn.</p>
        </div>
      )}
    </div>
  );
};

export default SellerBalance;
