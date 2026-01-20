import { Request, Response } from "express";
import { postService } from "./post.service";
import paginationSortingHelper from "../../helper/paginationSortingHelper";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const result = await postService.createPost(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: result,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    // structuring the query parameters
    const {
      search: querySearch,
      tags: queryTag,
      isFeatured: queryIsFeatured,
    } = req.query;

    const search = typeof querySearch === "string" ? querySearch : undefined;

    const isFeatured =
      queryIsFeatured === "true"
        ? true
        : queryIsFeatured === "false"
          ? false
          : undefined;

    let tags = (queryTag as string)?.split(",");
    if (tags?.length == 1 && tags[0] == "") {
      tags = [];
    }

    const queryLimit = req.query.limit ? Number(req.query.limit) : undefined;
    const queryPage = req.query.page ? Number(req.query.page) : undefined;
    const querySort = req.query.sortBy as string | undefined;
    console.log(querySort);
    const queryOrder = req.query.sortOrder as string | undefined;
    console.log(queryOrder);
    const { limit, page, sortBy, sortOrder } = paginationSortingHelper({
      limit: queryLimit,
      page: queryPage,
      sortBy: querySort,
      sortOrder: queryOrder,
    });
    console.log(limit, page, "sortBy", sortBy, "sortOrder", sortOrder);

    // the database call
    const result = await postService.getAllProduct({
      search: search,
      tags: tags,
      isFeatured: isFeatured,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "All posts retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { id: paramId } = req.params;
    const id = paramId as string;

    if (!id) {
      throw new Error("id is required");
    }

    const result = await postService.getPostById({ id });

    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log("adf");
    if (!user) {
      throw new Error("You are not authorized");
    }
    const result = await postService.getMyPost(user.id);

    res.status(200).json({
      success: true,
      message: "Your post retrieved successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof Error ? err.message : "Error while retrieving posts";
    res.status(500).json({
      success: false,
      message: message,
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("You are not authorized");
    }
    const isAdmin = user.role === "ADMIN";

    const result = await postService.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin,
    );

    res.status(200).json({
      success: true,
      message: "Your post retrieved successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof Error ? err.message : "Error while updating posts";
    res.status(500).json({
      success: false,
      message: message,
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("You are not authorized");
    }
    const isAdmin = user.role === "ADMIN";

    const result = await postService.deletePost(
      postId as string,
      user.id,
      isAdmin,
    );

    res.status(200).json({
      success: true,
      message: "The post is deleted.",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof Error ? err.message : "Error while deleting posts";
    res.status(500).json({
      success: false,
      message: message,
    });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const result = await postService.getStats();

    res.status(200).json({
      success: true,
      message: "Stats retrieved successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof Error ? err.message : "Error while retrieving stats";
    res.status(500).json({
      success: false,
      message: message,
    });
  }
};
export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
