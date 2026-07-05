import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { createServerSupabaseClient } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // store provider safely — account may be null on subsequent logins
        if (account) token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Extend the session user type inline
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      // `account` removed from destructuring — not used, avoids TS unused-var warning
      try {
        const supabase = createServerSupabaseClient();

        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .single();

        if (!existing) {
          const username =
            user.name?.replace(/\s+/g, "_").toLowerCase() ?? `user_${Date.now()}`;

          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            username,
          });

          await supabase.from("profiles").insert({
            user_id: user.id,
            avatar_url: user.image ?? "",
            interests: [],
          });
        }
        return true;
      } catch {
        // Always allow sign-in even if the DB insert fails;
        // the user can still chat as a guest.
        return true;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
