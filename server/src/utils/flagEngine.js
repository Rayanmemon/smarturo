/**
 * Pure function to compute analyte flags based on standard clinical reference ranges.
 * NO ML — deterministic reference range rules.
 *
 * @param {Object} reading - Urinalysis raw analyte values
 * @returns {Object} flags object with status per analyte and overallAbnormalCount
 */
function computeFlags(reading) {
  const leu = reading.leu;
  const nit = reading.nit;
  const uro = Number(reading.uro);
  const pro = Number(reading.pro);
  const ph = Number(reading.ph);
  const blo = reading.blo;
  const sg = Number(reading.sg);
  const ket = Number(reading.ket);
  const bil = Number(reading.bil);
  const glu = Number(reading.glu);

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
    (v) => v === 'Abnormal'
  ).length;

  return {
    ...flags,
    overallAbnormalCount,
  };
}

module.exports = { computeFlags };
