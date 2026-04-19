import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { verifySync } from "otplib";
import type { Role } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { getClientIp, sanitizeText, writeAuditLog } from "@/lib/security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        totp: { label: "Code 2FA", type: "text", optional: true },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          totp: credentials?.totp,
        });
        if (!parsed.success) {
          return null;
        }
        const { email, password } = parsed.data;
        const ip = request ? getClientIp(request) : null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          await writeAuditLog({
            action: "LOGIN_FAILED",
            resource: "User",
            details: sanitizeText(`email=${email}`, 500),
            ip,
          });
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          await writeAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            resource: "User",
            details: "invalid_password",
            ip,
          });
          return null;
        }

        if (user.totpEnabled && user.totpSecret) {
          const code = parsed.data.totp?.trim() ?? "";
          const totpOk =
            code.length === 6 ? verifySync({ secret: user.totpSecret, token: code }).valid : false;
          if (!code || !totpOk) {
            await writeAuditLog({
              userId: user.id,
              action: "LOGIN_FAILED_2FA",
              resource: "User",
              ip,
            });
            return null;
          }
        }

        await writeAuditLog({
          userId: user.id,
          action: "LOGIN_SUCCESS",
          resource: "User",
          ip,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role as Role,
        };
      },
    }),
  ],
});
