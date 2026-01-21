import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { postRouter } from "./modules/post/post.router";
import { commentRouter } from "./modules/comment/comment.router";
import { auth } from "./lib/auth";
import cors from "cors";
import { globalError } from "./middleware/globalError";
import { notFound } from "./middleware/notFound";

const app: Application = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);

app.use(notFound);
app.use(globalError);

export default app;
