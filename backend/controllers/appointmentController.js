const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @route   POST /api/appointments
// @access  Patient only
const bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({ message: 'Please provide doctorId, date, and time' });
  }

  try {
    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for double booking (same doctor, date, time, not cancelled)
    const conflict = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' },
    });
    if (conflict) {
      return res.status(409).json({
        message: 'This time slot is already booked for the selected doctor',
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
    });

    // Populate for a useful response
    await appointment.populate([
      { path: 'patientId', select: 'name email' },
      { path: 'doctorId', select: 'name specialization' },
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This time slot is already booked for the selected doctor',
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/appointments/:id/cancel
// @access  Patient (own) or Doctor (assigned) or Admin
// Note: ownership is verified by canAccessAppointment middleware — req.appointment is pre-loaded
const cancelAppointment = async (req, res) => {
  try {
    const appointment = req.appointment;

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/appointments/my
// @access  Patient (their bookings) | Doctor (their schedule) | Admin (all)
const getMyAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query.doctorId = doctor._id;
    }
    // admin gets all — query stays empty

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/appointments/:id/status
// @access  Doctor (assigned) or Admin
// Body: { status: "approved" | "rejected" }
// Note: canAccessAppointment middleware verifies ownership and attaches req.appointment
const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const ALLOWED = ['approved', 'rejected'];

  if (!status || !ALLOWED.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed values: ${ALLOWED.join(', ')}`,
    });
  }

  try {
    const appointment = req.appointment; // pre-loaded by canAccessAppointment

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled appointment' });
    }

    if (appointment.status === status) {
      return res.status(400).json({ message: `Appointment is already ${status}` });
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate([
      { path: 'patientId', select: 'name email' },
      { path: 'doctorId', select: 'name specialization' },
    ]);

    res.status(200).json({
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/appointments/doctor
// @access  Doctor only
const getDoctorAppointments = async (req, res) => {
  try {
    // Look up doctor profile by userId (set when admin creates the doctor)
    // Fall back to email match for legacy profiles without userId
    const doctor = await Doctor.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found. Ask an admin to create your doctor profile.',
      });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getMyAppointments,
  getDoctorAppointments,
};
