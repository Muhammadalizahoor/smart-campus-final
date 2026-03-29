const cron = require("node-cron"); //backend/src/jobs/monthlyReportJob.js

const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
const { firestore } = require("../config/firebase");
const { getOvercrowdingReport } = require("../controllers/overcrowdingController");

// Helper
function currentMonth() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// 🔥 REAL AUTOMATED JOB
function startMonthlyReportJob() {
  // ⏰ Every day at 11:30 AM
 cron.schedule("30 11 * * *", async () => {
    //cron.schedule("*/1 * * * *", async () => {//permintue for testing i did

    console.log("🕒 Running AUTO Monthly Report Job");

    try {
      const busesSnap = await firestore.collection("buses").get();
      const month = currentMonth();

      for (const busDoc of busesSnap.docs) {
        const busId = busDoc.id;

        // Call SAME logic you already trust
        const fakeReq = { query: { busId, month } };
        let reportData = null;

        const fakeRes = {
          json: (data) => (reportData = data),
          status: () => fakeRes
        };

        await getOvercrowdingReport(fakeReq, fakeRes);

        if (!reportData) continue;

        // 📁 Folder
        // const dir = path.join(
        //   __dirname,
        //   "../../reports/monthly",
        //   busId
        // );
        const dir = path.join(
  require("os").homedir(),
  "Downloads",
  "SmartCampusReports",
  "monthly",
  busId
);

        await fs.ensureDir(dir);

        const filePath = path.join(dir, `${month}.pdf`);

        // 📄 PDF
        // const doc = new PDFDocument();
        // doc.pipe(fs.createWriteStream(filePath));

        // doc.fontSize(18).text("Monthly Overcrowding Report", { align: "center" });
        // doc.moveDown();

        // Object.entries(reportData).forEach(([k, v]) => {
        //   doc.fontSize(12).text(`${k}: ${v}`);
        // });

        // doc.end();
        const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream(filePath));

/* =========================
   HEADER
========================= */
doc
  .fontSize(18)
  .font("Helvetica-Bold")
  .text("University of Engineering and Technology", { align: "center" });

doc
  .fontSize(12)
  .font("Helvetica")
  .text("Smart Campus Transit System", { align: "center" });

doc.moveDown(2);

/* =========================
   REPORT TITLE
========================= */
doc
  .fontSize(16)
  .font("Helvetica-Bold")
  .text("Monthly Overcrowding Analysis Report", { align: "center" });

doc.moveDown(2);

/* =========================
   BASIC INFO
========================= */
doc.fontSize(12).font("Helvetica");

doc.text(`Bus ID: ${reportData.busId}`);
doc.text(`Analysis Month: ${reportData.analysisMonth}`);
doc.text(`Bus Capacity: ${reportData.busCapacity}`);
doc.moveDown();

/* =========================
   TABLE HEADER
========================= */
doc.font("Helvetica-Bold");
doc.text("Summary", { underline: true });
doc.moveDown(0.5);

doc.font("Helvetica");

/* =========================
   TABLE-LIKE LAYOUT
========================= */
const table = [
  ["Peak Passengers", reportData.peakPassengers ?? "N/A"],
  ["Peak Day", reportData.peakDay ?? "N/A"],
  ["Overcrowding Status", reportData.overcrowdingStatus],
];

table.forEach(([label, value]) => {
  doc.text(`${label}:`, { continued: true, width: 200 });
  doc.text(` ${value}`);
});

doc.moveDown(2);

/* =========================
   RECOMMENDATION
========================= */
doc.font("Helvetica-Bold").text("Recommendation");
doc.moveDown(0.5);

doc
  .font("Helvetica")
  .text(reportData.recommendation, {
    align: "justify",
  });

doc.moveDown(3);

/* =========================
   FOOTER
========================= */
doc
  .fontSize(10)
  .text(
    `Report generated automatically on ${new Date().toLocaleString()}`,
    { align: "right" }
  );

doc.end();


        console.log(`✅ Auto report saved: ${filePath}`);
      }
    } catch (err) {
      console.error("❌ Auto report job failed:", err.message);
    }
  });
}

module.exports = { startMonthlyReportJob };
