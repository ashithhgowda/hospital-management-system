const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const generateSlots = require('../utils/generateSlots');

// @route   POST /api/doctors
// @access  Admin only
// Creates a User account (role: doctor) + linked Doctor profile in one step.
// Default password is "Doctor@123" — doctor should change it after first login.
const addDoctor = async (req, res) => {
  const { name, email, specialization, experience, availableSlots } = req.body;

  if (!name || !email || !specialization || experience === undefined) {
    return res.status(400).json({
      message: 'Please provide name, email, specialization, and experience',
    });
  }

  try {
    // Check for conflicts in both collections up front
    const [existingUser, existingDoctor] = await Promise.all([
      User.findOne({ email }),
      Doctor.findOne({ email }),
    ]);

    if (existingUser || existingDoctor) {
      return res.status(409).json({ message: 'A user or doctor with this email already exists' });
    }

    // Create the User account with role "doctor"
    const user = await User.create({
      name,
      email,
      password: 'Doctor@123', // default password — doctor should change after login
      role: 'doctor',
    });

    // Create the Doctor profile linked to the User
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email,
      specialization,
      experience,
      availableSlots: availableSlots || [],
    });

    res.status(201).json({
      message: 'Doctor added successfully. Default password: Doctor@123',
      doctor,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/doctors/:id
// @access  Admin only
// Removes the Doctor profile and the linked User account.
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Remove linked User account if it exists
    if (doctor.userId) {
      await User.findByIdAndDelete(doctor.userId);
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Doctor and linked user account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json({
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/doctors/specialization/:specialization
// @access  Public
const getDoctorsBySpecialization = async (req, res) => {
  const { specialization } = req.params;

  try {
    const doctors = await Doctor.find({
      specialization: { $regex: specialization, $options: 'i' },
    }).sort({ experience: -1 });

    if (doctors.length === 0) {
      return res.status(404).json({
        message: `No doctors found for specialization: ${specialization}`,
      });
    }

    res.status(200).json({
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Please provide a date query parameter (YYYY-MM-DD)' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
  }

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
    });

    const daySlot = doctor.availableSlots.find((s) => s.day === dayName);

    if (!daySlot) {
      return res.status(200).json({
        date,
        day: dayName,
        slots: [],
        message: `Doctor is not available on ${dayName}`,
      });
    }

    const allSlots = generateSlots(daySlot.startTime, daySlot.endTime);

    const booked = await Appointment.find({
      doctorId: id,
      date,
      status: { $ne: 'cancelled' },
    }).select('time');

    const bookedTimes = new Set(booked.map((a) => a.time));
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    res.status(200).json({
      date,
      day: dayName,
      range: `${daySlot.startTime} – ${daySlot.endTime}`,
      total: allSlots.length,
      available: availableSlots.length,
      slots: availableSlots,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addDoctor,
  deleteDoctor,
  getAllDoctors,
  getDoctorsBySpecialization,
  getAvailableSlots,
};
