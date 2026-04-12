import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "active",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"blog-app" <blog_app@gmail.com>', // sender address
                    to: user.email, // list of recipients
                    subject: "Please verify your email", // subject line
                    text: "Hello world?", // plain text body
                    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; margin-top:40px; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5; padding:20px; text-align:center; color:#ffffff;">
              <h2 style="margin:0;">Blog App</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h3 style="margin-top:0;">Verify Your Email</h3>
              <p>
                Hi there ${user.name},<br/><br/>
                Thanks for signing up! Please verify your email address by clicking the button below.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:30px 0;">
                <a href="${verificationURL}" 
                   style="background:#4f46e5; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:5px; display:inline-block;">
                   Verify Email
                </a>
              </div>

              <p>
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all; color:#4f46e5;">
                ${verificationURL}
              </p>

              <p style="margin-top:30px;">
                If you did not create an account, you can safely ignore this email.
              </p>

              <p>
                Thanks,<br/>
                <strong>Blog App Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f4; padding:15px; text-align:center; font-size:12px; color:#888;">
              © ${new Date().getFullYear()} Blog App. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>` // HTML body
                });

                console.log("Message sent: %s", info.messageId);
            } catch (err) {
                console.error("Error sending verification email:", err);
                throw new Error("Failed to send verification email");
            }
        },
    },
});