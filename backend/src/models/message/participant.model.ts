import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

export const Participant = mongoose.model("Participant", participantSchema);
