import { useEffect, useState, useMemo } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, useToast } from '../components/Toast';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

const statusConfig = {
  approved:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500' },
  rejected:  { cls: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400' },
  pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/appointments/doctor');
        setAppointments(data.appointments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => filter === 'all' ? appointments : appointments.filter((a) => a.status === filter), [appointments, filter]);

  const stats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    approved:  appointments.filter((a) => a.status === 'approved').length,
    rejected:  appointments.filter((a) => a.status === 'rejected').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }), [appointments]);

  const updateStatus = (id, newStatus) =>
    setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: newStatus } : a));

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await API.put(`/appointments/${id}/status`, { status: 'approved' });
      updateStatus(id, 'approved');
      toast.success('Appointment approved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '_reject');
    try {
      await API.put(`/appointments/${id}/status`, { status: 'rejected' });
      updateStatus(id, 'rejected');
      toast.warning('Appointment rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally { setActionLoading(null); }
  };

  const handleCancel = async (id) => {
    setActionLoading(id + '_cancel');
    try {
      await API.put(`/appointments/${id}/cancel`);
      updateStatus(id, 'cancelled');
      toast.info('Appointment cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin-custom" />
        <p className="text-gray-500 text-sm">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm">⚠️ {error}</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total',     value: stats.total,     color: 'text-blue-600',    bg: 'bg-blue-50',    icon: '📋' },
    { label: 'Pending',   value: stats.pending,   color: 'text-amber-600',   bg: 'bg-amber-50',   icon: '⏳' },
    { label: 'Approved',  value: stats.approved,  color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
    { label: 'Rejected',  value: stats.rejected,  color: 'text-gray-600',    bg: 'bg-gray-100',   icon: '🚫' },
    { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600',     bg: 'bg-red-50',     icon: '❌' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-emerald-100 text-sm mt-0.5">Welcome, Dr. {user.name}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, color, bg, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center text-base mx-auto mb-2`}>{icon}</div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                {appointments.filter((a) => a.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">No {filter === 'all' ? '' : filter} appointments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Patient', 'Email', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {appt.patientId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{appt.patientId?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{appt.patientId?.email || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{appt.date}</td>
                    <td className="px-5 py-4">
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">{appt.time}</span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(appt._id)} disabled={actionLoading === appt._id + '_approve'}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50">
                              {actionLoading === appt._id + '_approve' ? '...' : '✓ Approve'}
                            </button>
                            <button onClick={() => handleReject(appt._id)} disabled={actionLoading === appt._id + '_reject'}
                              className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                              {actionLoading === appt._id + '_reject' ? '...' : '✕ Reject'}
                            </button>
                          </>
                        )}
                        {appt.status === 'approved' && (
                          <button onClick={() => handleCancel(appt._id)} disabled={actionLoading === appt._id + '_cancel'}
                            className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                            {actionLoading === appt._id + '_cancel' ? '...' : '✕ Cancel'}
                          </button>
                        )}
                        {(appt.status === 'cancelled' || appt.status === 'rejected') && (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
