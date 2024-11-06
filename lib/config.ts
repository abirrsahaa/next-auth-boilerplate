import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../app/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

export const NEXT_AUTH_CONFIG = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        console.log('the credentials are -> ', credentials);
        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (existingUser) {
          const isPasswordValid = await verify(
            credentials.password,
            existingUser.password || ''
          );
          return isPasswordValid ? existingUser : null;
        }

        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        return await prisma.user.create({
          data: {
            name: credentials.name,
            email: credentials.email,
            password: hashedPassword,
          },
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('the details in signIn are ', {
        user,
        account,
        profile,
        email,
        credentials,
      });
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            userId: existingUser.id,
            ...account,
          },
          create: {
            userId: existingUser.id,
            ...account,
          },
        });
        return true;
      }

      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: true,
        },
      });

      await prisma.account.create({
        data: { userId: newUser.id, ...account },
      });

      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log('the details in jwt are ', {
        token,
        user,
        profile,
        account,
      });
      if (user) {
        token.uid = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('the details in session are ', {
        session,
        token,
      });
      session.user.id = token.uid;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;

      const expires = new Date(token.accessTokenExpires * 1000);

      // !need to fix here
      await prisma.session.upsert({
        where: { userId: token.uid },
        update: { expires },
        create: {
          sessionToken: token.accessToken,
          userId: token.uid,
          expires,
        },
      });

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function verify(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}
