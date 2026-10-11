const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarturo';

app.use(cors());
app.use(express.json());

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true, index: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Female', 'Male'] },
  createdAt: { type: Date, default: Date.now },
});

const Patient = mongoose.model('Patient', patientSchema);

const readingSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    color: { type: String, default: 'Yellow' },
    transparency: { type: String, default: 'Clear' },
    leu: { type: String, default: 'Negative' },
    nit: { type: String, default: 'Negative' },
    uro: { type: Number, default: 0.2 },
    pro: { type: Number, default: 0 },
    ph: { type: Number, default: 6.0 },
    blo: { type: String, default: 'Negative' },
    sg: { type: Number, default: 1.015 },
    ket: { type: Number, default: 0 },
    bil: { type: Number, default: 0 },
    glu: { type: Number, default: 0 },
    bacteria: { type: String, default: 'Absent' },
    diagnosis: { type: String, default: 'Normal' },
    flags: {
      leu: String,
      nit: String,
      uro: String,
      pro: String,
      ph: String,
      blo: String,
      sg: String,
      ket: String,
      bil: String,
      glu: String,
      overallAbnormalCount: { type: Number, default: 0 },
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Reviewed'],
      default: 'Pending',
    },
    reviewedBy: { type: String, default: '' },
    reviewNote: { type: String, default: '' },
  },
  { timestamps: true }
);

const Reading = mongoose.model('Reading', readingSchema);

function computeFlags(data) {
  const leu = data.leu;
  const nit = data.nit;
  const uro = Number(data.uro);
  const pro = Number(data.pro);
  const ph = Number(data.ph);
  const blo = data.blo;
  const sg = Number(data.sg);
  const ket = Number(data.ket);
  const bil = Number(data.bil);
  const glu = Number(data.glu);

  const flags = {
    leu: leu === 'Negative' ? 'Normal' : 'Abnormal',
    nit: nit === 'Negative' ? 'Normal' : 'Abnormal',
    uro: uro >= 0.1 && uro <= 1.0 ? 'Normal' : 'Abnormal',
    pro: pro <= 14 ? 'Normal' : 'Abnormal',
    ph: ph >= 4.5 && ph <= 8.0 ? 'Normal' : 'Abnormal',
    blo: blo === 'Negative' ? 'Normal' : 'Abnormal',
    sg: sg >= 1.005 && sg <= 1.030 ? 'Normal' : 'Abnormal',
    ket: ket <= 0 ? 'Normal' : 'Abnormal',
    bil: bil <= 0 ? 'Normal' : 'Abnormal',
    glu: glu <= 0 ? 'Normal' : 'Abnormal',
  };

  const overallAbnormalCount = Object.values(flags).filter(
    (val) => val === 'Abnormal'
  ).length;

  return { ...flags, overallAbnormalCount };
}

async function connectToDatabase() {
  try {
    console.log(`[SmartUro DB] Connecting to MongoDB: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`[SmartUro DB] Connected to local MongoDB!`);
  } catch (err) {
    console.warn(`[SmartUro DB] Local MongoDB unavailable (${err.message}). Starting In-Memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[SmartUro DB] Connected to In-Memory MongoDB at ${uri}`);
    } catch (memErr) {
      console.error('[SmartUro DB] Failed to start fallback MongoDB:', memErr);
      process.exit(1);
    }
  }

  const readingCount = await Reading.countDocuments();
  if (readingCount === 0) {
    const csvPath = path.join(__dirname, '../data/dataset.csv');
    if (fs.existsSync(csvPath)) {
      console.log(`[SmartUro DB] Database empty. Seeding initial records from ${csvPath}...`);
      const fileData = fs.readFileSync(csvPath, 'utf8');
      const lines = fileData.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const header = lines[0].split(',').map((h) => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < header.length) continue;

        const row = {};
        header.forEach((h, idx) => {
          row[h] = cols[idx];
        });

        if (!row.Patient_ID) continue;

        await Patient.updateOne(
          { patientId: row.Patient_ID },
          {
            $set: {
              patientId: row.Patient_ID,
              age: Number(row.Age) || 30,
              gender: row.Gender || 'Female',
            },
          },
          { upsert: true }
        );

        const raw = {
          color: row.Color || 'Yellow',
          transparency: row.Transparency || 'Clear',
          leu: row.LEU || 'Negative',
          nit: row.NIT || 'Negative',
          uro: Number(row.URO) || 0.2,
          pro: Number(row.PRO) || 0,
          ph: Number(row.pH) || 6.0,
          blo: row.BLO || 'Negative',
          sg: Number(row.SG) || 1.015,
          ket: Number(row.KET) || 0,
          bil: Number(row.BIL) || 0,
          glu: Number(row.GLU) || 0,
          bacteria: row.Bacteria || 'Absent',
        };

        const flags = computeFlags(raw);
        const reviewStatus = flags.overallAbnormalCount > 0 ? 'Pending' : 'Reviewed';

        await new Reading({
          patientId: row.Patient_ID,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          ...raw,
          diagnosis: row.Diagnosis || 'Normal',
          flags,
          reviewStatus,
        }).save();
      }
      console.log(`[SmartUro DB] Seeded ${await Reading.countDocuments()} urinalysis records!`);
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartUro API', database: 'MongoDB Connected' });
});

app.get('/api/stats/summary', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalReadings = await Reading.countDocuments();
    const abnormalReadings = await Reading.countDocuments({
      'flags.overallAbnormalCount': { $gte: 1 },
    });
    const normalReadings = await Reading.countDocuments({
      'flags.overallAbnormalCount': 0,
    });
    const pendingReview = await Reading.countDocuments({
      reviewStatus: 'Pending',
    });
    const reviewedReadings = await Reading.countDocuments({
      reviewStatus: 'Reviewed',
    });
    const signedOffAbnormal = await Reading.countDocuments({
      'flags.overallAbnormalCount': { $gte: 1 },
      reviewStatus: 'Reviewed',
    });

    const abnormalRate =
      totalReadings > 0
        ? Number(((abnormalReadings / totalReadings) * 100).toFixed(1))
        : 0;

    res.json({
      totalPatients,
      totalReadings,
      normalReadings,
      abnormalReadings,
      pendingReview,
      reviewedReadings,
      signedOffAbnormal,
      abnormalRate,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

app.get('/api/readings', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim();
      query.$or = [
        { patientId: { $regex: term, $options: 'i' } },
        { diagnosis: { $regex: term, $options: 'i' } },
      ];
    }

    const filter = req.query.filter || req.query.status;
    if (filter === 'abnormal') {
      query['flags.overallAbnormalCount'] = { $gte: 1 };
    } else if (filter === 'normal') {
      query['flags.overallAbnormalCount'] = 0;
    } else if (filter === 'pending') {
      query.reviewStatus = 'Pending';
    } else if (filter === 'reviewed') {
      query.reviewStatus = 'Reviewed';
    } else if (filter === 'signed_off' || filter === 'reviewed_abnormal') {
      query['flags.overallAbnormalCount'] = { $gte: 1 };
      query.reviewStatus = 'Reviewed';
    }

    const total = await Reading.countDocuments(query);
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const patientIds = [...new Set(readings.map((r) => r.patientId))];
    const patients = await Patient.find({ patientId: { $in: patientIds } }).lean();
    const patientMap = {};
    patients.forEach((p) => {
      patientMap[p.patientId] = p;
    });

    const enriched = readings.map((r) => ({
      ...r,
      patient: patientMap[r.patientId] || { age: 'N/A', gender: 'N/A' },
    }));

    res.json({
      readings: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to retrieve readings' });
  }
});

app.get('/api/readings/:id', async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id).lean();
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    const patient = await Patient.findOne({ patientId: reading.patientId }).lean();
    res.json({ ...reading, patient: patient || null });
  } catch (err) {
    console.error('Error fetching reading by id:', err);
    res.status(500).json({ error: 'Failed to retrieve reading' });
  }
});

app.post('/api/readings', async (req, res) => {
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

    if (!patientId || !patientId.trim()) {
      const count = await Patient.countDocuments();
      patientId = `P${String(count + 1).padStart(4, '0')}`;
    } else {
      patientId = patientId.trim().toUpperCase();
    }

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

    const raw = {
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

    const flags = computeFlags(raw);
    const reviewStatus = flags.overallAbnormalCount > 0 ? 'Pending' : 'Reviewed';

    const newReading = new Reading({
      patientId,
      timestamp: new Date(),
      ...raw,
      diagnosis: diagnosis || (flags.overallAbnormalCount > 0 ? 'Abnormal Flagged' : 'Normal'),
      flags,
      reviewStatus,
    });

    const saved = await newReading.save();
    console.log(`[SmartUro] Saved new test for ${patientId} (Flags: ${flags.overallAbnormalCount})`);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving reading:', err);
    res.status(500).json({ error: 'Failed to create reading', message: err.message });
  }
});

app.patch('/api/readings/:id/review', async (req, res) => {
  try {
    const { reviewedBy, reviewNote } = req.body;
    const reading = await Reading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    reading.reviewStatus = 'Reviewed';
    reading.reviewedBy = reviewedBy || 'Attending Clinician';
    if (reviewNote !== undefined) {
      reading.reviewNote = reviewNote;
    }

    await reading.save();
    res.json(reading);
  } catch (err) {
    console.error('Error reviewing reading:', err);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[SmartUro] Server listening on http://localhost:${PORT}`);
    console.log(`[SmartUro] Node.js + Express + MongoDB integration ready`);
    console.log(`====================================================`);
  });
});

module.exports = app;
