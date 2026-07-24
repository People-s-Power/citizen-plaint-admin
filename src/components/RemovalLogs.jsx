import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HTTP_URI } from '@/utils/constants';

const REASON_LABELS = {
  grace_period_expired: 'Grace period expired (no payment)',
  subscription_cancelled: 'Subscription cancelled',
  manual: 'Manually removed',
};

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const RemovalLogs = ({ users }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserName = (id) => {
    if (!id) return '—';
    const user = (users || []).find((u) => u._id === id);
    return user?.name || id;
  };

  const getOrgName = (id) => {
    // For now show the ID — could be enriched with org lookup
    if (!id) return '—';
    const user = (users || []).find((u) => u._id === id);
    return user?.name || id;
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${HTTP_URI}/transaction/subscription/removal-logs`)
      .then((res) => {
        setLogs(res.data?.logs || []);
      })
      .catch((err) => {
        console.error('Failed to fetch removal logs:', err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7a60f]"></div>
        <span className="ml-3 text-gray-500">Loading removal logs...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-lg font-medium">No removals yet</p>
        <p className="text-sm mt-1 text-gray-400">
          Professionals are only removed when an org&apos;s subscription payment fails and the grace period expires.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4">
        <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
          <span>🚨</span> Professional Removal Log
        </h3>
        <p className="text-xs text-red-700 mt-1">
          This table shows all professionals automatically removed from organizations due to failed subscription payments.
          When a payment fails, the org gets a 3-day grace period. If payment isn&apos;t made, the professional is removed.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="table-auto w-full">
          <thead className="bg-red-600 text-white text-left">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">Removed At</th>
              <th className="px-4 py-3 text-sm font-semibold">Professional</th>
              <th className="px-4 py-3 text-sm font-semibold">Organization</th>
              <th className="px-4 py-3 text-sm font-semibold">Plan</th>
              <th className="px-4 py-3 text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-sm font-semibold">Gateway</th>
              <th className="px-4 py-3 text-sm font-semibold">Reason</th>
              <th className="px-4 py-3 text-sm font-semibold">Grace Expired</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log, idx) => (
              <tr key={log._id || idx} className="hover:bg-red-50/50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                  {formatDate(log.removedAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                  {getUserName(log.professionalId)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getOrgName(log.orgId)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                    {log.planType
                      ? log.planType.charAt(0).toUpperCase() + log.planType.slice(1)
                      : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.currency || '$'} {Number(log.amount || 0).toLocaleString()}/mo
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.gateway ? log.gateway.charAt(0).toUpperCase() + log.gateway.slice(1) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                    {REASON_LABELS[log.reason] || log.reason || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(log.graceExpiredAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-xs text-gray-400">
        Showing {logs.length} removal{logs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default RemovalLogs;
