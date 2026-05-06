import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const todayStr = () => new Date().toISOString().split('T')[0];

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselected = location.state?.doctor || null;

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(!preselected);
  const [form, setForm] = useState({ doctorId: preselected?._id || '', date: '', time: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(preselected);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsInfo, setSlotsInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselected) return;
    const fetchDoctors = async () => {
      try {
        const { data } = await API.get('/doctors');
        setDoctors(data.doctors);
      } catch {
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [preselected]);

  useEffect(() => {
    if (!form.doctorId || !form.date) { setSlots([]); setSlotsInfo(''); return; }
    const fetchSlots = async () => {
      setLoadingSlots(true); setSlots([]); setSlotsInfo('');
      setForm((f) => ({ ...f, time: '' }));
      try {
        const { data } = await API.get(`/doctors/${form.doctorId}/slots?date=${form.date}`);
        setSlots(data.slots);
        setSlotsInfo(data.slots.length > 0
          ? `${data.day} · ${data.range} · ${data.available} of ${data.total} slots available`
          : data.message || `No available slots on ${data.day}`);
      } catch {
        setSlotsInfo('Could not load slots. Please try again.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [form.doctorId, form.date]);

  const handleDoctorChange = (e) => {
    const id = e.target.value;
    setSelectedDoctor(doctors.find((d) => d._id === id) || null);
    setForm((f) => ({ ...f, doctorId: id, time: '', date: '' }));
    setError('');
  };

  const handleChange = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.time) { setError('Please fill in all fields.'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await API.post('/appointments', form);
      setSuccess(`Appointment booked with ${selectedDoctor?.name || 'the doctor'} on ${form.date} at ${form.time}.`);
      setForm((f) => ({ ...f, date: '', time: '' }));
      setSlots([]); setSlotsInfo('');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StepBadge = ({ n, label }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
        {n}
      </div>
      <span className="font-semibold text-gray-800 text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 transition-colors group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/8 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-7 py-6 text-white">
            <h1 className="text-xl font-bold">Book an Appointment</h1>
            <p className="text-blue-100 text-sm mt-1">Fill in the details below to schedule your visit</p>
          </div>

          {/* Success */}
          {success && (
            <div className="mx-6 mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
              <span className="text-xl flex-shrink-0">✅</span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800 text-sm">Appointment Booked!</p>
                <p className="text-emerald-700 text-xs mt-0.5">{success}</p>
              </div>
              <button onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
                View
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-7 space-y-7">
            {/* Step 1 — Doctor */}
            <div>
              <StepBadge n="1" label="Select Doctor" />
              {preselected ? (
                <div className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-xl bg-blue-50/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {preselected.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{preselected.name}</p>
                    <p className="text-xs text-gray-500">{preselected.specialization}</p>
                  </div>
                  <button type="button"
                    onClick={() => { setSelectedDoctor(null); setForm((f) => ({ ...f, doctorId: '', time: '' })); navigate('/book-appointment'); }}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all">
                    Change
                  </button>
                </div>
              ) : loadingDoctors ? (
                <p className="text-gray-400 text-sm italic">Loading doctors...</p>
              ) : (
                <select name="doctorId" value={form.doctorId} onChange={handleDoctorChange} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 bg-white transition-all cursor-pointer">
                  <option value="">— Choose a doctor —</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.name} — {doc.specialization}</option>
                  ))}
                </select>
              )}
              {selectedDoctor && !preselected && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>🩺 {selectedDoctor.experience} yrs experience</span>
                  <span>📧 {selectedDoctor.email}</span>
                </div>
              )}
            </div>

            {/* Step 2 — Date */}
            <div>
              <StepBadge n="2" label="Select Date" />
              <input type="date" name="date" value={form.date} onChange={handleChange} min={todayStr()} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 bg-white transition-all" />
            </div>

            {/* Step 3 — Time */}
            <div>
              <StepBadge n="3" label="Select Time Slot" />
              {!form.doctorId || !form.date ? (
                <p className="text-gray-400 text-sm italic">Select a doctor and date to see available slots.</p>
              ) : loadingSlots ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin-custom" />
                  Loading available slots...
                </div>
              ) : slots.length === 0 ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  <span>📅</span> {slotsInfo || 'No available slots for this date.'}
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-3">{slotsInfo}</p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {slots.map((slot) => (
                      <button key={slot} type="button"
                        onClick={() => { setForm((f) => ({ ...f, time: slot })); setError(''); }}
                        className={`py-2 text-xs font-medium rounded-xl border transition-all hover:scale-105 ${
                          form.time === slot
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/25'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Summary */}
            {form.doctorId && form.date && form.time && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 animate-fade-in">
                <p className="text-sm font-semibold text-blue-800 mb-3">📋 Booking Summary</p>
                {[
                  ['Doctor', selectedDoctor?.name],
                  ['Specialization', selectedDoctor?.specialization],
                  ['Date', form.date],
                  ['Time', form.time],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-blue-100 last:border-0">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit"
              disabled={submitting || !form.doctorId || !form.date || !form.time}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
                  Booking...
                </span>
              ) : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
