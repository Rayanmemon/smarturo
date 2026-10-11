const { body, validationResult } = require('express-validator');

const validatePatient = [
  body('patientId')
    .optional()
    .isString()
    .trim()
    .matches(/^P\d{4,}$/)
    .withMessage('Patient_ID must match format P0001'),
  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({ min: 0, max: 120 })
    .withMessage('Age must be an integer between 0 and 120'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Female', 'Male'])
    .withMessage('Gender must be Female or Male'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

const validateReading = [
  body('patientId')
    .notEmpty()
    .withMessage('patientId is required')
    .isString()
    .trim(),
  body('color')
    .notEmpty()
    .isIn(['Pale Yellow', 'Yellow', 'Dark Yellow', 'Amber'])
    .withMessage('Invalid Color value'),
  body('transparency')
    .notEmpty()
    .isIn(['Clear', 'Cloudy'])
    .withMessage('Invalid Transparency value'),
  body('leu')
    .notEmpty()
    .isIn(['Negative', '++', '+++'])
    .withMessage('Invalid LEU value'),
  body('nit')
    .notEmpty()
    .isIn(['Negative', 'Positive'])
    .withMessage('Invalid NIT value'),
  body('uro')
    .notEmpty()
    .isFloat({ min: 0, max: 20 })
    .withMessage('URO must be a float between 0 and 20'),
  body('pro')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('PRO must be a non-negative number'),
  body('ph')
    .notEmpty()
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH must be between 0 and 14'),
  body('blo')
    .notEmpty()
    .isIn(['Negative', 'Trace', '+', '++'])
    .withMessage('Invalid BLO value'),
  body('sg')
    .notEmpty()
    .isFloat({ min: 0.9, max: 1.1 })
    .withMessage('Specific Gravity (SG) must be between 0.9 and 1.1'),
  body('ket')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('KET must be a non-negative number'),
  body('bil')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('BIL must be a non-negative number'),
  body('glu')
    .notEmpty()
    .isFloat({ min: 0 })
    .withMessage('GLU must be a non-negative number'),
  body('bacteria')
    .notEmpty()
    .isIn(['Absent', 'Present'])
    .withMessage('Invalid Bacteria value'),
  body('diagnosis')
    .optional()
    .isIn([
      'Normal',
      'UTI',
      'Diabetes',
      'Kidney Disease',
      'Liver Disease',
      'Dehydration',
      'Unspecified',
    ])
    .withMessage('Invalid Diagnosis label'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

const validateReview = [
  body('reviewedBy')
    .notEmpty()
    .withMessage('Reviewer name (reviewedBy) is required')
    .isString()
    .trim(),
  body('reviewNote').optional().isString().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

module.exports = {
  validatePatient,
  validateReading,
  validateReview,
};
