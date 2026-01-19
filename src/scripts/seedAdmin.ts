import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    const adminData = {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      role: process.env.ADMIN_ROLE,
      password: process.env.ADMIN_PASS,
      // emailVerified: true,
    };

    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email!,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const signUpUser = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        credentials: "include",
        body: JSON.stringify(adminData),
      }
    );

    // The emailVerified is not reflecting a true while creating the data.
    // So we'll update it after creating the admin row.
    if (signUpUser.ok) {
      const update = await prisma.user.update({
        where: {
          email: adminData.email!,
        },
        data: {
          emailVerified: true,
        },
      });
    }
    //
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
