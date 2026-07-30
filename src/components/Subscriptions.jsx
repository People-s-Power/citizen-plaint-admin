import React, { useEffect, useState } from 'react';
import axios from "axios";
import AssingProfessional from './AssingProfessional';

const STATUS_STYLES = {
  active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Active' },
  past_due: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Past Due' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Cancelled' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Expired' },
  trialing: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Trialing' },
};

const GATEWAY_LABELS = {
  stripe: '💳 Stripe',
  paystack: '💳 Paystack',
  wallet: '👛 Wallet',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
};

const Subscriptions = ({ users }) => {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | past_due | expired | cancelled

  const getAuthor = (id) => {
    if (!id) return '—';
    const user = (users || []).find((u) => u._id === id);
    return user?.name || id;
  };

  const getSub = async () => {
    try {
      const res = await axios.get("/admin/subscriptions/unassigned?page=1&limit=100");
      setSubs(res.data?.data?.subscriptions || res.data?.subscriptions || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSub();
  }, []);

  const filtered = filter === 'all'
    ? subs
    : subs.filter((s) => {
        const status = String(s.status || '').toLowerCase();
        if (filter === 'expired') return status === 'expired' || s.expired;
        return status === filter;
      });

  // Summary counts
  const counts = {
    all: subs.length,
    active: subs.filter((s) => s.status === 'active' && !s.expired).length,
    past_due: subs.filter((s) => s.status === 'past_due' || s.grace).length,
    expired: subs.filter((s) => s.status === 'expired' || s.expired).length,
    cancelled: subs.filter((s) => s.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'all', label: 'Total', color: 'border-gray-200' },
          { key: 'active', label: 'Active', color: 'border-green-300' },
          { key: 'past_due', label: 'Past Due', color: 'border-amber-300' },
          { key: 'expired', label: 'Expired', color: 'border-gray-300' },
          { key: 'cancelled', label: 'Cancelled', color: 'border-red-300' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              filter === item.key ? `${item.color} bg-white shadow-sm` : 'border-transparent bg-gray-50 hover:bg-white'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{counts[item.key] || 0}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="table-auto w-full">
          <thead className="bg-gold text-white text-left">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-sm font-semibold">Organization</th>
              <th className="px-4 py-3 text-sm font-semibold">Plan</th>
              <th className="px-4 py-3 text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-sm font-semibold">Gateway</th>
              <th className="px-4 py-3 text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-sm font-semibold">Next Billing</th>
              <th className="px-4 py-3 text-sm font-semibold">Grace</th>
              <th className="px-4 py-3 text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered?.length > 0 ? (
              filtered.map((sub) => {
                const status = String(sub.status || (sub.expired ? 'expired' : 'active')).toLowerCase();
                const gateway = String(sub.gateway || 'wallet').toLowerCase();
                const planType = sub.planType
                  ? sub.planType.charAt(0).toUpperCase() + sub.planType.slice(1)
                  : sub.duration || '—';

                return (
                  <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {getAuthor(sub.author)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {planType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {sub.currency || '$'} {Number(sub.amount || 0).toLocaleString()}
                      <span className="text-gray-400 text-xs">/mo</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {GATEWAY_LABELS[gateway] || gateway}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(sub.nextBillingDate)}
                    </td>
                    <td className="px-4 py-3">
                      {sub.grace ? (
                        <div>
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            ⚠️ Grace
                          </span>
                          {sub.graceExpiresAt && (
                            <div className="text-[10px] text-amber-600 mt-0.5">
                              Expires: {formatDate(sub.graceExpiresAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-1">
                      <AssingProfessional users={users} sub={sub} getSub={() => getSub()} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-lg">
                  No subscriptions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
