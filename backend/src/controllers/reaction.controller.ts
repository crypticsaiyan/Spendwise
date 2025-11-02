import { Comment } from "../models/posts/comment.model";
import { Post } from "../models/posts/post.model";
import { Reaction } from "../models/posts/reaction.model";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiRespose";
import asyncHandler from "../utils/asyncHandler";

const toggleReaction = asyncHandler(async (req: any, res: any) => {
  const { reactionTo, reactionToId, reactionType } = req.body;
  // Validate inputs
  if (!["Post", "Comment"].includes(reactionTo)) {
    throw new ApiError(400, "Invalid reactionTo type");
  }
  // only allow these reaction types for now
  if (!["like", "dislike"].includes(reactionType)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  const ParentModel = reactionTo == "Post" ? Post : Comment;
  const parentDoc = await ParentModel.findById(reactionToId);

  if (!parentDoc) {
    throw new ApiError(404, `${reactionTo} not found`);
  }

  const existingReaction = await Reaction.findOne({
    userId: req.user._id,
    reactionTo,
    reactionToId,
  });

  let message = "";
  let reactionPromise;
  let countPromise;

  if (!existingReaction) {
    reactionPromise = Reaction.create({
      userId: req.user._id,
      reactionTo,
      reactionToId,
      reactionType,
    });
    const fieldToIncrement =
      reactionType == "like" ? "likeCount" : "dislikeCount";
    countPromise = ParentModel.findByIdAndUpdate(reactionToId, {
      $inc: { [fieldToIncrement]: 1 },
    });
    message = "Reaction added";
  } else {
    // if type is same delete the prev and decrement the typecount
    if (existingReaction.reactionType == reactionType) {
      reactionPromise = Reaction.findByIdAndDelete(existingReaction._id);

      const fieldToDecrement =
        existingReaction.reactionType == "like" ? "likeCount" : "dislikeCount";

      countPromise = ParentModel.findByIdAndUpdate(reactionToId, {
        $inc: { [fieldToDecrement]: -1 },
      });

      message = "Reaction removed";
    } else {
      // if type is different replace the prev type and increment the other typecount
      reactionPromise = Reaction.findByIdAndUpdate(existingReaction._id, {
        $set: { reactionType },
      });

      const fieldToIncrement =
        reactionType == "like" ? "likeCount" : "dislikeCount";
      const fieldToDecrement =
        reactionType == "like" ? "dislikeCount" : "likeCount";

      countPromise = ParentModel.findByIdAndUpdate(reactionToId, {
        $inc: { [fieldToIncrement]: 1, [fieldToDecrement]: -1 },
      });

      message = "Reaction changed";
    }
  }

  await Promise.all([reactionPromise, countPromise]); // do in parallel

  return res.status(200).json(new ApiResponse(200, message));
});

export {
  toggleReaction
}
