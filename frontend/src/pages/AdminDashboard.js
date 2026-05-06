import { useEffect, useState } from 'react';
import API from '../api/axios';
import { ToastContainer, useToast } from '../components/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = { name: '', email: '', specialization: '', experience: '' };
const emptySlot = { day: 'Monday', startTime: '09:00', endTime: '17:00' };

const AdminDashboard = () => {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(emptyForm);
  const [slots, setSlots]           = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const { toasts, toast, removeToast } = useToast();

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/doctors');
      setDoctors(data.doctors);
    } catch { setError('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const addSlot = () => setSlots([...slots, { ...emptySlot }]);
  const updateSlot = (i, field, value) => setSlots(slots.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const { data } = await API.post('/doctors', { ...form, experience: Number(form.experience), availableSlots: slots });
      setSuccess(`${data.doctor.name} added. Default password: Doctor@123`);
      toast.success(`Dr. ${data.doctor.name} added successfully`);
      setForm(emptyForm); setSlots([]); setShowForm(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    setDeletingId(id);
    try {
      await API.delete(`/doctors/${id}`);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      setSuccess(`Dr. ${name} deleted successfully`);
      toast.success(`Dr. ${name} deleted successfully`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally { setDeletingId(null); }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 bg-gray-50/50 transition-all hover:border-gray-300";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl border border-white/30">⚙️</div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 text-sm mt-0.5">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
              showForm ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' : 'bg-white text-purple-700 hover:bg-purple-50 shadow-sm'
            }`}>
            {showForm ? '✕ Cancel' : '+ Add Doctor'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Add Doctor Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-7 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-purple-600 rounded-full" />
            New Doctor Profile
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Smith" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Specialization *</label>
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiology" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Experience (years) *</label>
                <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} placeholder="5" required className={inputCls} />
              </div>
            </div>

            {/* Slots */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls + ' mb-0'}>Available Slots</label>
                <button type="button" onClick={addSlot}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all font-medium">
                  + Add Slot
                </button>
              </div>
              {slots.length === 0 && (
                <p className="text-xs text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3">
                  No slots added. Doctor won't appear in booking calendar.
                </p>
              )}
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-wrap">
                    <select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[120px]">
                      {DAYS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    <span className="text-gray-400 text-sm">→</span>
                    <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                    <button type="button" onClick={() => removeSlot(i)}
                      className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs mb-6">
              <span>🔑</span>
              A user account will be created with default password <strong className="font-semibold">Doctor@123</strong>
            </div>

            <button type="submit" disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-2.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
                  Adding...
                </span>
              ) : 'Add Doctor'}
            </button>
          </form>
        </div>
      )}

      {/* Doctor List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin-custom" />
          <p className="text-gray-500 text-sm">Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">👨‍⚕️</p>
          <p className="text-gray-500 text-base">No doctors yet. Add one above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-600 rounded-full" />
              Registered Doctors
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{doctors.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Doctor', 'Email', 'Specialization', 'Experience', 'Slots', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {doc.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{doc.email}</td>
                    <td className="px-5 py-4">
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium px-2.5 py-1 rounded-full">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{doc.experience} yr{doc.experience !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-4">
                      {doc.availableSlots.length === 0 ? (
                        <span className="text-gray-300 text-xs">None</span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-medium">
                          {doc.availableSlots.length} day{doc.availableSlots.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(doc._id, doc.name)}
                        disabled={deletingId === doc._id}
                        className="text-red-500 hover:text-white border border-red-200 hover:border-red-500 hover:bg-red-500 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5">
                        {deletingId === doc._id ? (
                          <><span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin-custom" /> Deleting...</>
                        ) : '🗑 Delete'}
                      </button>
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

export default AdminDashboard;
