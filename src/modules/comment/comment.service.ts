import { Comment, CommentStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.authorId,
    },
  });

  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  const result = await prisma.comment.create({
    data: payload,
  });

  return result;
};

const getCommentById = async (id: string) => {
  const result = await prisma.comment.findUnique({
    where: {
      id,
    },
    include: {
      post: {
        select: {
          content: true,
          _count: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return result;
};

const getCommentByAuthorId = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: {
      authorId: authorId,
      parentId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
      replies: true,
    },
  });

  return result;
};

const deleteComment = async (commentId: string, authorId: string) => {
  // if(req.user.authorId === )
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!commentData) {
    throw new Error("your provided input is invalid.");
  }

  const result = await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });

  return result;
};

const updateComment = async (
  authorId: string,
  commentId: string,
  data: {
    content?: string;
    status?: CommentStatus;
  },
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!commentData) {
    throw new Error("You are providing Invalid data");
  }

  await prisma.comment.update({
    where: {
      id: commentData.id,
    },
    data,
  });
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
};
