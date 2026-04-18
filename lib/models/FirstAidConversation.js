import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true, maxlength: 12000 },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const FirstAidConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true,
      unique: true,
    },
    anonymousId: {
      type: String,
      index: true,
      sparse: true,
      unique: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
      validate: [(arr) => !arr || arr.length <= 120, "Too many messages"],
    },
  },
  { timestamps: true },
);

export default mongoose.models.FirstAidConversation ||
  mongoose.model("FirstAidConversation", FirstAidConversationSchema);
