import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  fleetSize: { type: String, required: true },
  message: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model('Query', QuerySchema);
