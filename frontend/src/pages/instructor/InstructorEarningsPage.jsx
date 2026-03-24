import { useEffect, useState } from 'react';
import { Spinner, StatCard } from '../../components/common/UI';
import API from '../../services/api';

export default function InstructorEarningsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/instructor/earnings')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { totalEarnings = 0, payments = [], breakdown = [] } = data || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Earnings</h1>
        <p className="text-gray-500 text-sm mt-1">Track your revenue across all courses</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon="💰" />
        <StatCard label="Total Transactions" value={payments.length} icon="🧾" />
        <StatCard label="Avg per Sale" value={payments.length > 0 ? `₹${Math.round(totalEarnings / payments.length).toLocaleString()}` : '₹0'} icon="📈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Per-course breakdown */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue by Course</h2>
          {breakdown.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No revenue yet</div>
          ) : (
            <div className="space-y-3">
              {breakdown.map((b, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-gray-800 truncate flex-1 mr-3">{b.course.title}</p>
                    <p className="font-semibold text-primary">₹{b.total.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-400">{b.count} sale{b.count !== 1 ? 's' : ''} · ₹{b.course.price} each</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((b.total / totalEarnings) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {payments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No transactions yet</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {payments.slice(0, 20).map((p) => (
                  <div key={p._id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-sm shrink-0">₹</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.student?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.course?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary">+₹{p.amount}</p>
                      <p className="text-xs text-gray-400">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
