import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { JSONFileAdapter } from '@/lib/auth-adapter';

// Add better logging for authentication issues
const authLogger = (message: string, error?: any) => {
  console.log(`[Auth] ${message}`, error ? error : '');
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    }),
  ],
  adapter: JSONFileAdapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        authLogger(`JWT callback: Adding access token for user ${user?.id || 'unknown'}`);
        token.accessToken = account.access_token || '';
      }
      // Add user data to the token on initial sign in
      if (user) {
        token.userId = user.id || '';
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Add a custom error page for better error feedback
  },
  events: {
    // Add event handlers for better logging and troubleshooting
    async signIn(message) {
      authLogger(`User signed in: ${message.user.email}`);
    },
    async signOut(message) {
      authLogger(`User signed out: ${message.session?.user?.email || 'unknown'}`);
    },
    async error(message) {
      authLogger(`Auth error:`, message);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'this-is-a-secret-value-for-repotronium-development',
};

export default NextAuth(authOptions);
