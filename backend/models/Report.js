import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vehId: { type: String, required: true },
  driver: { type: String, required: true },
  status: { type: String, required: true },
  shift: { type: String, required: true },
  hours: { type: String, required: true },
  note: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);
