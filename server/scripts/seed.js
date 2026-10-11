const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Patient = require('../src/models/Patient');
const Reading = require('../src/models/Reading');
const { computeFlags } = require('../src/utils/flagEngine');
const { connectDB } = require('../src/utils/db');

const csvFilePath = process.argv[2] || path.join(__dirname, '../data/dataset.csv');

/**
 * Generate synthetic timestamp spread evenly across the last 12 months.
 */
function getRandomTimestampInPastYear(index, total) {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const startMs = oneYearAgo.getTime();
  const endMs = now.getTime();
  const interval = (endMs - startMs) / total;
  const timeMs = startMs + index * interval + Math.random() * 3600000;
  return new Date(timeMs);
}

async function seed() {
  try {
    await connectDB();

    if (!fs.existsSync(csvFilePath)) {
      console.error(`[Seed Error] CSV file not found at path: ${csvFilePath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) {
      console.error('[Seed Error] CSV file is empty or only contains header.');
      process.exit(1);
    }

    const header = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1);

    console.log(`[Seed] Found ${rows.length} records to import.`);

    let patientsProcessed = 0;
    let readingsInserted = 0;
    let errorsSkipped = 0;

    await Patient.deleteMany({});
    await Reading.deleteMany({});
    console.log('[Seed] Cleared existing Patient and Reading collections.');

    for (let i = 0; i < rows.length; i++) {
      const rowLine = rows[i];
      const cols = rowLine.split(',').map((c) => c.trim());

      if (cols.length < header.length) {
        console.warn(`[Seed Warning] Row ${i + 2} skipped due to invalid column count.`);
        errorsSkipped++;
        continue;
      }

      const rowObj = {};
      header.forEach((h, idx) => {
        rowObj[h] = cols[idx];
      });

      const {
        Patient_ID,
        Age,
        Gender,
        Color,
        Transparency,
        LEU,
        NIT,
        URO,
        PRO,
        pH,
        BLO,
        SG,
        KET,
        BIL,
        GLU,
        Bacteria,
        Diagnosis,
      } = rowObj;

      if (!Patient_ID) {
        console.warn(`[Seed Warning] Row ${i + 2} skipped missing Patient_ID.`);
        errorsSkipped++;
        continue;
      }

      // 1. Upsert Patient
      await Patient.updateOne(
        { patientId: Patient_ID },
        {
          $set: {
            patientId: Patient_ID,
            age: Number(Age),
            gender: Gender,
          },
        },
        { upsert: true }
      );
      patientsProcessed++;

      // 2. Build Reading
      const rawReading = {
        color: Color,
        transparency: Transparency,
        leu: LEU,
        nit: NIT,
        uro: Number(URO),
        pro: Number(PRO),
        ph: Number(pH),
        blo: BLO,
        sg: Number(SG),
        ket: Number(KET),
        bil: Number(BIL),
        glu: Number(GLU),
        bacteria: Bacteria,
      };

      const flags = computeFlags(rawReading);
      const reviewStatus = flags.overallAbnormalCount >= 1 ? 'Pending' : 'Reviewed';
      const timestamp = getRandomTimestampInPastYear(i, rows.length);

      const readingDoc = new Reading({
        patientId: Patient_ID,
        timestamp,
        ...rawReading,
        diagnosis: Diagnosis || 'Normal',
        flags,
        reviewStatus,
      });

      await readingDoc.save();
      readingsInserted++;
    }

    const uniquePatientsCount = await Patient.countDocuments();

    console.log('\n================ SEED SUMMARY ================');
    console.log(`Total CSV rows evaluated: ${rows.length}`);
    console.log(`Unique Patients stored:   ${uniquePatientsCount}`);
    console.log(`Readings inserted:        ${readingsInserted}`);
    console.log(`Errors / Rows skipped:    ${errorsSkipped}`);
    console.log('==============================================\n');

    await mongoose.disconnect();
    console.log('[Seed] Completed seeding successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Unhandled seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
