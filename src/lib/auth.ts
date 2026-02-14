import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.GAPP_USER,
    pass: process.env.GAPP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.FRONTEND_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ token, url, user }) => {
      try {
        const info = await transporter.sendMail({
          from: `"prisma blog post app" <no-reply@prismablog.com>`,
          to: user.email,
          subject: "Verification email",
          html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Email Verification</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 0;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">
                      <tr>
                        <td style="text-align:center;">
                          <h2 style="color:#333;">Verify your email</h2>
                        </td>
                      </tr>

                      <tr>
                        <td style="color:#555; font-size:15px; line-height:1.6;">
                          <p>Hello <strong>${user.name}</strong>,</p>
                          <p>
                            Thanks for signing up! Please confirm your email address by clicking the button below.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding:20px 0;">
                          <a
                            href="${url}"
                            style="
                              background:#4f46e5;
                              color:#ffffff;
                              text-decoration:none;
                              padding:12px 24px;
                              border-radius:6px;
                              font-weight:bold;
                              display:inline-block;
                            "
                          >
                            Verify Email
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td style="color:#777; font-size:13px; line-height:1.5;">
                          <p>
                            If the button doesn’t work, copy and paste this link into your browser:
                          </p>
                          <p style="word-break:break-all;">
                            <a href="${url}" style="color:#4f46e5;">
                              ${url}
                            </a>
                          </p>
                          <p>
                            This link will expire soon. If you didn’t create an account, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-top:30px; font-size:12px; color:#999; text-align:center;">
                          <p>© ${Date.now()} Your App Name. All rights reserved.</p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        });
      } catch (err) {
        console.error(err);
      }
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
