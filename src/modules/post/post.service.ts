import { Post } from "../../../generated/prisma/client";
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

export const postService = {
  createPost,
  getAllProduct,
  getPostById,
};
