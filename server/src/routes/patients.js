const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Reading = require('../models/Reading');
const { validatePatient } = require('../middleware/validation');

/**
 * Helper to auto-generate next Patient ID (e.g., P0501)
 */
async function generateNextPatientId() {
  const latestPatient = await Patient.findOne({
    patientId: /^P\d{4,}$/,
  }).sort({ patientId: -1 });

  if (!latestPatient) {
    return 'P0001';
  }

  const num = parseInt(latestPatient.patientId.replace('P', ''), 10);
  const nextNum = isNaN(num) ? 1 : num + 1;
  return `P${String(nextNum).padStart(4, '0')}`;
}

// GET /api/patients - List patients (paginated, filtered, searchable)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    if (req.query.ageMin || req.query.ageMax) {
      query.age = {};
      if (req.query.ageMin) query.age.$gte = Number(req.query.ageMin);
      if (req.query.ageMax) query.age.$lte = Number(req.query.ageMax);
    }

    if (req.query.search) {
      query.patientId = { $regex: req.query.search.trim(), $options: 'i' };
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach latest reading metadata for each patient
    const patientIds = patients.map((p) => p.patientId);

    // Get latest reading for each patientId
    const latestReadings = await Reading.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$patientId',
          latestDiagnosis: { $first: '$diagnosis' },
          latestTimestamp: { $first: '$timestamp' },
          latestAbnormalCount: { $first: '$flags.overallAbnormalCount' },
          totalReadings: { $sum: 1 },
        },
      },
    ]);

    const readingMap = {};
    latestReadings.forEach((r) => {
      readingMap[r._id] = r;
    });

    const enrichedPatients = patients.map((patient) => {
      const r = readingMap[patient.patientId];
      return {
        ...patient,
        latestDiagnosis: r ? r.latestDiagnosis : 'N/A',
        latestReadingDate: r ? r.latestTimestamp : null,
        abnormalCount: r && r.latestAbnormalCount !== undefined ? r.latestAbnormalCount : 0,
        totalReadings: r ? r.totalReadings : 0,
      };
    });

    res.json({
      patients: enrichedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Server error while fetching patients' });
  }
});

// GET /api/patients/:patientId - Get single patient + all readings
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).lean();

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const readings = await Reading.find({ patientId })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      patient,
      readings,
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Server error fetching patient details' });
  }
});

// POST /api/patients - Create a new patient
router.post('/', validatePatient, async (req, res) => {
  try {
    let { patientId, age, gender } = req.body;

    if (!patientId) {
      patientId = await generateNextPatientId();
    } else {
      const existing = await Patient.findOne({ patientId });
      if (existing) {
        return res
          .status(400)
          .json({ error: `Patient ID ${patientId} already exists` });
      }
    }

    const newPatient = new Patient({
      patientId,
      age: Number(age),
      gender,
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Server error creating patient' });
  }
});

module.exports = router;
