import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not defined");

const client = new MongoClient(uri);
const clientPromise = client.connect();

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("FACEBOOK_CLIENT_ID:", process.env.FACEBOOK_CLIENT_ID);
console.log("FACEBOOK_CLIENT_SECRET:", process.env.FACEBOOK_CLIENT_SECRET);
console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID);
console.log("GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET);
console.log("LINKEDIN_CLIENT_ID:", process.env.LINKEDIN_CLIENT_ID);
console.log("LINKEDIN_CLIENT_SECRET:", process.env.LINKEDIN_CLIENT_SECRET);

export const authOptions = {
  adapter: null,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        const client = await clientPromise;
        const db = client.db("learning_platform");
        const user = await db.collection("Users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: `${user.firstName} ${user.lastName}`, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName 
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile, tokens) {
        console.log("Google Profile Response:", profile);
        console.log("Google Tokens:", tokens);

        const nameParts = profile.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName,
          lastName,
          role: "student",
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      userinfo: {
        params: { fields: "id,name,email,picture" },
      },
      async profile(profile, tokens) {
        console.log("Facebook Profile Response:", profile);
        console.log("Facebook Tokens:", tokens);

        const nameParts = profile.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        if (!profile.email) {
          console.warn(`No email provided by Facebook for user ID: ${profile.id}`);
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || `${profile.id}@facebook-placeholder.com`,
          image: profile.picture?.data?.url || "",
          firstName,
          lastName,
          role: "student",
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
      async profile(profile, tokens) {
        console.log("GitHub Profile Response:", profile);
        console.log("GitHub Tokens:", tokens);

        if (!profile.id) {
          console.error("GitHub profile ID is missing!");
          throw new Error("GitHub profile ID is missing");
        }

        const nameParts = (profile.name || profile.login).split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        if (!profile.email) {
          console.warn(`No email provided by GitHub for user ID: ${profile.id}`);
        }

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || `${profile.id}@github-placeholder.com`,
          image: profile.avatar_url || "",
          firstName,
          lastName,
          role: "student",
        };
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      async profile(profile, tokens) {
        console.log("LinkedIn Profile Response:", profile);
        console.log("LinkedIn Tokens:", tokens);

        const nameParts = (profile.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        if (!profile.email) {
          console.warn(`No email provided by LinkedIn for user ID: ${profile.sub}`);
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email || `${profile.sub}@linkedin-placeholder.com`,
          image: profile.picture || "",
          firstName,
          lastName,
          role: "student",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn Callback - User (before):", user);
      console.log("SignIn Callback - Account:", account);
      console.log("SignIn Callback - Provider:", account?.provider);

      if (account?.provider === "credentials") {
        const client = await clientPromise;
        const db = client.db("learning_platform");

        const dbUser = await db.collection("Users").findOne({ email: user.email });
        if (dbUser) {
          console.log("Updating existing user with ID:", dbUser._id);
          await db.collection("Users").updateOne(
            { _id: dbUser._id },
            { $set: { lastActive: new Date() } }
          );
          user.id = dbUser._id.toString();
        } else {
          throw new Error("User not found in database during sign-in");
        }
      } else {
        user.id = account.providerAccountId;
        user.role = user.role || "student";
      }

      console.log("SignIn Callback - User (after):", user);
      return true;
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", token);

      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role || "student";
        session.user.firstName = token.firstName; // Add firstName to session
        session.user.lastName = token.lastName;   // Add lastName to session
        session.provider = token.provider;
      }

      if (session.provider === "credentials") {
        const client = await clientPromise;
        const db = client.db("learning_platform");

        const sessionEntry = {
          userId: session.user.id,
          sessionToken: token.jti,
          expires: new Date(token.exp * 1000),
          createdAt: new Date(),
        };

        await db.collection("sessions").updateOne(
          { sessionToken: token.jti },
          { $set: sessionEntry },
          { upsert: true }
        );

        console.log("Stored session in MongoDB for Credentials provider:", sessionEntry);
      }

      return session;
    },
    async jwt({ token, user, account }) {
      console.log("JWT Callback - User:", user);
      console.log("JWT Callback - Account:", account);

      if (user) {
        token.sub = user.id;
        token.role = user.role || "student";
        token.provider = account?.provider;
        token.firstName = user.firstName; // Store firstName in JWT
        token.lastName = user.lastName;   // Store lastName in JWT
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      if (url.includes("/auth/signin")) {
        console.log("Preventing redirect to /auth/signin, redirecting to /auth/sign-in instead");
        return `${baseUrl}/auth/sign-in`;
      }
      if (url.includes("/auth/error")) {
        console.log("Redirecting to error page with query parameters");
        return url;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  debug: true,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };