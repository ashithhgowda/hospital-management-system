import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, useToast } from '../components/Toast';

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

const Dashboard = () => {
  const { user } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await API.get('/appointments/my');
        setAppointments(apptRes.data.appointments);
        if (user.role === 'patient' || user.role === 'admin') {
          const docRes = await API.get('/doctors');
          setDoctors(docRes.data.doctors);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const [cancelling, setCancelling] = useState(null);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin-custom" />
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const roleGradients = {
    admin:   'from-purple-600 to-indigo-700',
    doctor:  'from-emerald-600 to-teal-700',
    patient: 'from-blue-600 to-indigo-700',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Welcome banner */}
      <div className={`bg-gradient-to-r ${roleGradients[user.role] || roleGradients.patient} rounded-2xl p-6 mb-8 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-white/70 text-sm mt-0.5 ">
              {user.role} · {user.email}
            </p>
          </div>
          <span className="ml-auto bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: appointments.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: appointments.filter(a => a.status === 'approved').length, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Doctor list — patient & admin only */}
      {(user.role === 'patient' || user.role === 'admin') && doctors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full" />
            Available Doctors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.slice(0, 6).map((doc) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{doc.name}</p>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{doc.specialization}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">🩺 {doc.experience} yrs experience</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Appointments */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-600 rounded-full" />
          {user.role === 'admin' ? 'All Appointments' : 'My Appointments'}
        </h2>

        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500 text-sm">No appointments found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-900">{appt.patientId?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-900">{appt.doctorId?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{appt.date}</td>
                      <td className="px-5 py-4">
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">{appt.time}</span>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
                      <td className="px-5 py-4">
                        {appt.status !== 'cancelled' && appt.status !== 'rejected' && (
                          <button
                            onClick={() => handleCancel(appt._id)}
                            disabled={cancelling === appt._id}
                            className="text-xs text-red-600 hover:text-white border border-red-200 hover:border-red-500 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {cancelling === appt._id ? (
                              <><span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin-custom" /> Cancelling...</>
                            ) : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
