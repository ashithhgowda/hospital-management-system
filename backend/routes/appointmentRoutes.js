const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getMyAppointments,
  getDoctorAppointments,
} = require('../controllers/appointmentController');
const {
  protect,
  isPatient,
  isDoctor,
  isAdmin,
  authorizeRoles,
  canAccessAppointment,
} = require('../middleware/authMiddleware');

// All routes require a valid JWT
router.use(protect);

// POST /api/appointments
// Patient only — book a new appointment
router.post('/', isPatient, bookAppointment);

// GET /api/appointments/my
// Patient → their bookings | Doctor → their schedule | Admin → all
router.get('/my', getMyAppointments);

// GET /api/appointments/doctor
// Doctor only — appointments where doctorId matches logged-in doctor's profile
router.get('/doctor', isDoctor, getDoctorAppointments);

// PUT /api/appointments/:id/cancel
// Patient (own) | Doctor (assigned) | Admin
router.put('/:id/cancel', canAccessAppointment, cancelAppointment);

// PUT /api/appointments/:id/status  { status: "approved" | "rejected" }
// Doctor (assigned) | Admin only
router.put('/:id/status', canAccessAppointment, authorizeRoles('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
