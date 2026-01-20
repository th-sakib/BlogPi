import e, { Router } from "express";
import { postController } from "./post.controller";
import auth from "../../middleware/auth";

const router = e.Router();

router.get("/stats", postController.getStats);

router.get("/", postController.getAllPost);
router.get("/my-post", auth("USER", "ADMIN"), postController.getMyPost);
router.get("/:id", postController.getPostById);

router.post("/", auth("USER", "ADMIN"), postController.createPost);

router.patch("/:postId", auth("USER", "ADMIN"), postController.updatePost);
router.delete("/:postId", auth("USER", "ADMIN"), postController.deletePost);

export const postRouter: Router = router;
