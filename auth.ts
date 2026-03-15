import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user }) {
      if (ALLOWED_EMAILS.length === 0) return false;
      if (!ALLOWED_EMAILS.includes(user.email ?? "")) return false;

      await prisma.user.upsert({
        where: { email: user.email! },
        update: { name: user.name, image: user.image, lastLogin: new Date() },
        create: { email: user.email!, name: user.name, image: user.image },
      });

      return true;
    },
  },
});
