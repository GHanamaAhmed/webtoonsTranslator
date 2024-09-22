import { NextAuthOptions } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Adapter } from "next-auth/adapters";
import { User } from "@prisma/client";

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    // CredentialsProvider({
    //   name: "credentials",
    //   credentials: {
    //     email: {
    //       label: "email",
    //       placeholder: "email",
    //     },
    //     password: {
    //       label: "password",
    //       placeholder: "password",
    //     },
    //   },
    //   async authorize(credentials, req) {
    //     const user = await db.user.findUnique({
    //       where: {
    //         email: credentials?.email,
    //       },
    //     });
    //     if (!user) return null;
    //     if (user.password != credentials?.password) return null;
    //     return user;
    //   },
    // }),
    // EmailProvider({
    //   from: process.env.USER_NODE_MAILER,
    //   sendVerificationRequest({
    //     identifier: email,
    //     url,
    //     provider: { from },
    //   }) {

    //   },
    // }),
  ],
  callbacks: {
    async signIn({ email, account, user }) {
      try {
        const sub = db.subscription.findFirst({
          where: {
            userId: user.id,
            pricing: {
              price: 0,
            },
          },
        });
        if (!sub) {
          const pricing = await db.pricing.findFirst({
            where: {
              price: 0,
            },
          });
          if (pricing) {
            db.subscription.create({
              data: {
                userId: user.id,
                currentPeriodStart: new Date(Date.now()),
                currentPeriodEnd: new Date(1000 * 60 * 60 * 24 * 7),
                maxQuantity: 15,
                pricingId: pricing.id,
                gatewaySubscriptionId: "",
                status: "ACTIVE",
              },
            });
          }
        }
        return true;
      } catch (e) {
        return true;
      }
    },
    async session({ session, user }) {
      session.user.id = (user as User).id;
      session.user.name = (user as User).name!;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
