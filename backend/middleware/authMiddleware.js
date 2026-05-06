const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verify JWT and attach user to req ───────────────────────────────────────

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

// ─── Generic role guard ───────────────────────────────────────────────────────

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// ─── Named role shortcuts ─────────────────────────────────────────────────────

const isAdmin   = authorizeRoles('admin');
const isDoctor  = authorizeRoles('doctor');
const isPatient = authorizeRoles('patient');

// ─── Appointment ownership guard ──────────────────────────────────────────────
// Ensures a patient or doctor can only act on their own appointments.
// Must be used after protect. Attaches the found appointment to req.appointment.

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const canAccessAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { role, _id, email } = req.user;

    if (role === 'admin') {
      req.appointment = appointment;
      return next();
    }

    if (role === 'patient') {
      if (appointment.patientId.toString() !== _id.toString()) {
        return res.status(403).json({ message: 'Access denied. This is not your appointment' });
      }
      req.appointment = appointment;
      return next();
    }

    if (role === 'doctor') {
      const doctorProfile = await Doctor.findOne({
        $or: [{ userId: _id }, { email }],
      });
      if (!doctorProfile || appointment.doctorId.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({ message: 'Access denied. This appointment is not assigned to you' });
      }
      req.appointment = appointment;
      return next();
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, authorizeRoles, isAdmin, isDoctor, isPatient, canAccessAppointment };
