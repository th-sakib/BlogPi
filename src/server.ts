import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database is connected.");
    app.listen(port, () => {
      console.log(`App is listening at port ${port}`);
    })
  } catch (err) {
    console.error("An error occurs", err);
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(1);
    }
  }
}

main();
