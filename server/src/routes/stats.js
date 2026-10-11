const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Reading = require('../models/Reading');

/**
 * SmartUro KPI Stats API
 * Returns dashboard metrics for college project overview
 */
router.get('/summary', async (req, res) => {
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
      abnormalRate,
    });
  } catch (error) {
    console.error('[SmartUro Error] Failed to fetch stats:', error);
    res.status(500).json({ error: 'Server error fetching summary stats' });
  }
});

module.exports = router;
