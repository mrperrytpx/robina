import NextAuth, { AuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../prisma/prisma";
import { html, text } from "../../../util/nextauthEmailtext";
import { createTransport } from "nodemailer";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's name. */
            name: string;
            email: string;
            image: string;
            id: string;
            username: string;
        };
    }
}

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: +process.env.EMAIL_SERVER_PORT!,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            secret: process.env.NEXTAUTH_SECRET,
            async sendVerificationRequest(params) {
                const { identifier, url, provider, theme } = params;
                const { host } = new URL(url);
                const transport = createTransport(provider.server);
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host }),
                    html: html({ url, host, theme }),
                });
                const failed = result.rejected
                    .concat(result.pending)
                    .filter(Boolean);
                if (failed.length) {
                    throw new Error(
                        `Email(s) (${failed.join(", ")}) could not be sent`
                    );
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        session: async ({
            session,
            user,
        }: Awaited<{ session: Session; user: any }>) => {
            if (session?.user && user.id) {
                session.user.id = user.id;
                session.user.username = user.username;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/signin",
        // signOut: "/auth/signout",
        // error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/signin/verify-login", // (used for check email message)
        // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
    },
};

export default NextAuth(authOptions);
