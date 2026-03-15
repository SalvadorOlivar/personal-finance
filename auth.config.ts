import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Configuracion Edge-compatible (sin Prisma ni modulos Node.js)
// Usada solo en middleware.ts
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};
