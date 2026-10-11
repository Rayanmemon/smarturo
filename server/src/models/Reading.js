const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    color: {
      type: String,
      required: true,
      enum: ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber'],
    },
    transparency: {
      type: String,
      required: true,
      enum: ['Clear', 'Cloudy'],
    },
    leu: {
      type: String,
      required: true,
      enum: ['Negative', '++', '+++'],
    },
    nit: {
      type: String,
      required: true,
      enum: ['Negative', 'Positive'],
    },
    uro: {
      type: Number,
      required: true,
    },
    pro: {
      type: Number,
      required: true,
      min: 0,
    },
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14,
    },
    blo: {
      type: String,
      required: true,
      enum: ['Negative', 'Trace', '+', '++'],
    },
    sg: {
      type: Number,
      required: true,
      min: 0.9,
      max: 1.1,
    },
    ket: {
      type: Number,
      required: true,
      min: 0,
    },
    bil: {
      type: Number,
      required: true,
      min: 0,
    },
    glu: {
      type: Number,
      required: true,
      min: 0,
    },
    bacteria: {
      type: String,
      required: true,
      enum: ['Absent', 'Present'],
    },
    diagnosis: {
      type: String,
      default: 'Unspecified',
      enum: [
        'Normal',
        'UTI',
        'Diabetes',
        'Kidney Disease',
        'Liver Disease',
        'Dehydration',
        'Unspecified',
      ],
    },
    flags: {
      leu: { type: String, enum: ['Normal', 'Abnormal'] },
      nit: { type: String, enum: ['Normal', 'Abnormal'] },
      uro: { type: String, enum: ['Normal', 'Abnormal'] },
      pro: { type: String, enum: ['Normal', 'Abnormal'] },
      ph: { type: String, enum: ['Normal', 'Abnormal'] },
      blo: { type: String, enum: ['Normal', 'Abnormal'] },
      sg: { type: String, enum: ['Normal', 'Abnormal'] },
      ket: { type: String, enum: ['Normal', 'Abnormal'] },
      bil: { type: String, enum: ['Normal', 'Abnormal'] },
      glu: { type: String, enum: ['Normal', 'Abnormal'] },
      overallAbnormalCount: { type: Number, default: 0 },
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Reviewed'],
      default: 'Pending',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for querying a patient's readings ordered by date
readingSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);
