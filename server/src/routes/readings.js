const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const Patient = require('../models/Patient');
const { computeFlags } = require('../utils/flagEngine');

/**
 * SmartUro Backend API - Urinalysis Readings
 * Final Year College Project: Urinalysis Decision Support System
 * Powered by Node.js, Express, MongoDB (Mongoose)
 */

// GET /api/readings - List urinalysis records with search, filter, and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by Patient ID or Diagnosis
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      query.$or = [
        { patientId: { $regex: searchTerm, $options: 'i' } },
        { diagnosis: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Filter by test condition
    const filter = req.query.filter || req.query.status;
    if (filter === 'abnormal') {
      query['flags.overallAbnormalCount'] = { $gte: 1 };
    } else if (filter === 'normal') {
      query['flags.overallAbnormalCount'] = 0;
    } else if (filter === 'pending') {
      query.reviewStatus = 'Pending';
    } else if (filter === 'reviewed') {
      query.reviewStatus = 'Reviewed';
    }

    // Direct filters if supplied individually
    if (req.query.diagnosis) query.diagnosis = req.query.diagnosis;
    if (req.query.reviewStatus) query.reviewStatus = req.query.reviewStatus;
    if (req.query.patientId) query.patientId = req.query.patientId;

    const total = await Reading.countDocuments(query);
    const readings = await Reading.find(query)
      .sort({ timestamp: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach Patient demographic info (Age, Gender) for convenient display
    const patientIds = [...new Set(readings.map((r) => r.patientId))];
    const patients = await Patient.find({ patientId: { $in: patientIds } }).lean();
    const patientMap = {};
    patients.forEach((p) => {
      patientMap[p.patientId] = p;
    });

    const enrichedReadings = readings.map((r) => ({
      ...r,
      patient: patientMap[r.patientId] || { age: 'N/A', gender: 'N/A' },
    }));

    res.json({
      readings: enrichedReadings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[SmartUro Error] Failed to fetch readings:', error);
    res.status(500).json({ error: 'Failed to retrieve urinalysis readings' });
  }
});

// GET /api/readings/:id - Fetch single reading by MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id).lean();
    if (!reading) {
      return res.status(404).json({ error: 'Reading record not found' });
    }

    // Fetch associated patient details
    const patient = await Patient.findOne({ patientId: reading.patientId }).lean();

    res.json({
      ...reading,
      patient: patient || null,
    });
  } catch (error) {
    console.error('[SmartUro Error] Failed to fetch reading details:', error);
    res.status(500).json({ error: 'Failed to retrieve reading details' });
  }
});

// POST /api/readings - Submit new urinalysis test reading
router.post('/', async (req, res) => {
  try {
    let {
      patientId,
      age,
      gender,
      color,
      transparency,
      leu,
      nit,
      uro,
      pro,
      ph,
      blo,
      sg,
      ket,
      bil,
      glu,
      bacteria,
      diagnosis,
    } = req.body;

    // Auto-generate patient ID if not provided (e.g., P0501)
    if (!patientId || !patientId.trim()) {
      const count = await Patient.countDocuments();
      patientId = `P${String(count + 1).padStart(4, '0')}`;
    } else {
      patientId = patientId.trim().toUpperCase();
    }

    // Save or update Patient demographic record in MongoDB
    await Patient.updateOne(
      { patientId },
      {
        $set: {
          patientId,
          age: Number(age) || 28,
          gender: gender === 'Male' ? 'Male' : 'Female',
        },
      },
      { upsert: true }
    );

    // Format raw urinalysis values
    const rawReading = {
      color: color || 'Yellow',
      transparency: transparency || 'Clear',
      leu: leu || 'Negative',
      nit: nit || 'Negative',
      uro: Number(uro) || 0.2,
      pro: Number(pro) || 0,
      ph: Number(ph) || 6.0,
      blo: blo || 'Negative',
      sg: Number(sg) || 1.015,
      ket: Number(ket) || 0,
      bil: Number(bil) || 0,
      glu: Number(glu) || 0,
      bacteria: bacteria || 'Absent',
    };

    // Evaluate analyte reference ranges using deterministic rule engine
    const flags = computeFlags(rawReading);

    // If any analyte is abnormal, default status is Pending review by clinician
    const reviewStatus = flags.overallAbnormalCount >= 1 ? 'Pending' : 'Reviewed';

    const newReading = new Reading({
      patientId,
      timestamp: new Date(),
      ...rawReading,
      diagnosis: diagnosis || (flags.overallAbnormalCount > 0 ? 'Abnormal Flagged' : 'Normal'),
      flags,
      reviewStatus,
    });

    const savedReading = await newReading.save();
    console.log(`[SmartUro] New test created for ${patientId} (Abnormal count: ${flags.overallAbnormalCount})`);

    res.status(201).json(savedReading);
  } catch (error) {
    console.error('[SmartUro Error] Failed to create reading:', error);
    res.status(500).json({ error: 'Failed to save urinalysis reading', message: error.message });
  }
});

// PATCH /api/readings/:id/review - Clinician sign-off
router.patch('/:id/review', async (req, res) => {
  try {
    const { reviewedBy, reviewNote } = req.body;

    const reading = await Reading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ error: 'Reading record not found' });
    }

    reading.reviewStatus = 'Reviewed';
    reading.reviewedBy = reviewedBy || 'Attending Clinician';
    if (reviewNote !== undefined) {
      reading.reviewNote = reviewNote;
    }

    await reading.save();
    res.json(reading);
  } catch (error) {
    console.error('[SmartUro Error] Failed to update review status:', error);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

module.exports = router;
