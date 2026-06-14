import mongoose from "mongoose";

const PredictionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true,
    },
    anonymousId: {
      type: String,
      index: true,
      sparse: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PredictionHistory ||
  mongoose.model("PredictionHistory", PredictionHistorySchema);
