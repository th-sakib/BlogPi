import { Post, PostStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  payload: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  authorId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId,
    },
  });

  return result;
};

const getAllProduct = async (payload: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const skip = (payload.page - 1) * payload.limit;

  const result = await prisma.post.findMany({
    where: {
      AND: {
        ...(payload.search && {
          OR: [
            {
              title: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: payload.search,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: payload.search,
              },
            },
          ],
        }),

        ...(payload.tags?.length && {
          tags: {
            hasEvery: payload.tags,
          },
        }),
        ...(typeof payload.isFeatured === "boolean" && {
          isFeatured: payload.isFeatured,
        }),
      },
    },
    take: payload.limit,
    skip: skip,
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
  });

  const totalPost = await prisma.post.count();

  return {
    data: result,
    pagination: {
      totalPost,
      limit: payload.limit,
      page: payload.page,
      totalPage: Math.ceil(totalPost / payload.limit),
    },
  };
};

const getPostById = async (payload: { id: string }) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: payload.id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const postData = await prisma.post.findUniqueOrThrow({
      where: {
        id: payload.id,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: "APPROVED",
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return postData;
  });
};

const getMyPost = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
  });

  // only get posts if the user is active
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

/**
 * USER: can update own posts excluding the isFeatured field
 * ADMIN: can update everyone's post
 */
const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You don't have proper permissions.");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId === authorId) {
    throw new Error("You don't have permission");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

const getStats = async () => {
  // TODO: These can be cached because its too expensive to perform. explore the ways to cache this data
  return await prisma.$transaction(async (tx) => {
    const [
      totalPost,
      publishedPost,
      draftPosts,
      archivedPost,
      totalComments,
      totalViews,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      tx.post.count({ where: { status: PostStatus.DRAFT } }),
      tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
      tx.comment.count(),
      tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPost,
      publishedPost,
      draftPosts,
      archivedPost,
      totalComments,
      totalViews,
    };
  });
};

export const postService = {
  createPost,
  getAllProduct,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
