const DoctorCard = ({ doctor, onBook }) => {
  const { name, specialization, experience, email, availableSlots = [] } = doctor;

  const avatarColors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];
  const colorIndex = name.charCodeAt(0) % avatarColors.length;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${avatarColors[colorIndex]}`} />

      <div className="p-5 flex gap-4 flex-1">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{name}</h3>

          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 mb-3 border border-blue-100">
            {specialization}
          </span>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>🩺</span>
              <span>{experience} {experience === 1 ? 'yr' : 'yrs'} experience</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
              <span>📧</span>
              <span className="truncate">{email}</span>
            </div>
          </div>

          {availableSlots.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 font-medium mb-1.5">Available slots</p>
              <div className="flex flex-wrap gap-1">
                {availableSlots.slice(0, 3).map((slot, i) => (
                  <span key={i} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md">
                    {slot.day.slice(0, 3)} {slot.startTime}–{slot.endTime}
                  </span>
                ))}
                {availableSlots.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">+{availableSlots.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {onBook && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onBook(doctor)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
          >
            Book Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
