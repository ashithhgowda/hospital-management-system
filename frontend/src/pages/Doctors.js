import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import DoctorCard from '../components/DoctorCard';
import { useAuth } from '../context/AuthContext';

const Doctors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await API.get('/doctors');
        setDoctors(data.doctors);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => {
    const unique = [...new Set(doctors.map((d) => d.specialization))];
    return unique.sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase());
      const matchesSpec = selectedSpec ? doc.specialization === selectedSpec : true;
      return matchesSearch && matchesSpec;
    });
  }, [doctors, search, selectedSpec]);

  const handleClear = () => { setSearch(''); setSelectedSpec(''); };
  const handleBook = (doctor) => navigate('/book-appointment', { state: { doctor } });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin-custom" />
        <p className="text-gray-500 text-sm">Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm">⚠️ {error}</div>
        <button onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-500 mt-1">
          {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 bg-white transition-all"
          />
        </div>

        <select
          value={selectedSpec}
          onChange={(e) => setSelectedSpec(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all min-w-[180px] cursor-pointer"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        {(search || selectedSpec) && (
          <button onClick={handleClear}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Result count */}
      {(search || selectedSpec) && (
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
          {selectedSpec && <span> for <span className="text-blue-600">"{selectedSpec}"</span></span>}
          {search && <span> matching <span className="text-blue-600">"{search}"</span></span>}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-base mb-4">No doctors found matching your search.</p>
          <button onClick={handleClear}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onBook={user?.role === 'patient' ? handleBook : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
