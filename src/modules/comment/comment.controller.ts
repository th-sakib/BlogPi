import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createdComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    req.body.authorId = userId;

    const result = await commentService.createComment(req.body);

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error while creating comment",
      details: err?.message,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const result = await commentService.getCommentById(commentId as string);

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error while retrieving comment",
      details: err?.message,
    });
  }
};

const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentService.getCommentByAuthorId(
      authorId as string,
    );

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error while retrieving comment",
      details: err?.message,
    });
  }
};

const deleteCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.deleteComment(
      commentId as string,
      req.user?.id as string,
    );
    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error while deleting comment",
      details: err?.message,
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    const result = await commentService.updateComment(
      user?.id as string,
      commentId as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Error while updating comment",
      details: err?.message,
    });
  }
};

export const commentController = {
  createdComment,
  getCommentById,
  getCommentByAuthorId,
  deleteCommentById,
  updateComment,
};
