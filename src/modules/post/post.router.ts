import e, { Router } from "express";
import { postController } from "./post.controller";
import auth from "../../middleware/auth";

const router = e.Router();

router.get("/", postController.getAllPost);
router.get("/:id/", postController.getPostById);
router.post("/", auth("USER"), postController.createPost);

export const postRouter: Router = router;
