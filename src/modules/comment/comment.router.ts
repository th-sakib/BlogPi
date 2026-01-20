import { Router } from "express";
import { commentController } from "./comment.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/:commentId", commentController.getCommentById);
router.get("/author/:authorId", commentController.getCommentByAuthorId);

router.post("/", auth("ADMIN", "USER"), commentController.createdComment);

router.delete(
  "/:commentId",
  auth("ADMIN", "USER"),
  commentController.deleteCommentById,
);

router.patch(
  "/:commentId",
  auth("ADMIN", "USER"),
  commentController.updateComment,
);

export const commentRouter: Router = router;
