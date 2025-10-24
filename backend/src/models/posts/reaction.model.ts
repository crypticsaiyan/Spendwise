import mongoose, { Schema } from "mongoose";

const reactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reactionTo: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    reactionToId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "reactionTo", // tells mongoose to look for the value of reactionTo
    },
    reactionType: {
      // 1 -> like, 0 -> dislike
      type: Boolean,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

export const Reaction = mongoose.model("Reaction", reactionSchema);
