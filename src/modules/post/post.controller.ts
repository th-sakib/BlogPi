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
export const postController = {
  createPost,
  getAllPost,
  getPostById,
};
