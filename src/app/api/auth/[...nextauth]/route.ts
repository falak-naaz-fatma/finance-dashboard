import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        return null;
                    }

                    // In a production app, you would compare hashed passwords here
                    // For this example, we'll do a simple comparison
                    if (user.password !== credentials.password) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name || user.email,
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    await connectDB();
                    const userExists = await User.findOne({ email: user.email });

                    if (!userExists) {
                        await User.create({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            provider: "google",
                            providerId: account.providerAccountId,
                        });
                    }
                } catch (error) {
                    console.error("Error during sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                await connectDB();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login"
    }
});

export { handler as GET, handler as POST };