'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

import { Mail, Chrome } from 'lucide-react';
import { CustomSignInProps } from '@/types';
import { formSchema } from '@/lib/validation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';

export default function CustomSignIn({
  providers = ['google', 'github', 'credentials'],
  error = '',
  brandName = 'Your Brand',
  primaryColor = 'bg-blue-600 hover:bg-blue-700',
}: CustomSignInProps) {
  // Client-side only state
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(error);

  const router = useRouter();

  const session = useSession();

  // Initialize form after mounting
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!mounted) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Your authentication logic here
      console.log('Form values:', values);
      const res = await signIn('credentials', {
        name: values.name,
        email: values.email,
        password: values.password,
        redirect: false,
      });
      console.log('the res is ', res);
      if (res?.error) console.log(res.error);
      else router.push('/');
    } catch (error) {
      console.error('An error occurred:', error);
      setErrorMsg('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration issues by waiting for client-side mount
  if (!mounted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {brandName}
          </CardTitle>
          <CardDescription className="text-center">Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {brandName}
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        {providers.includes('google') && (
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={async () => await signIn('google')}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        )}
        {providers.includes('github') && (
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={() => {}}
          >
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        )}
        {providers.includes('credentials') && mounted && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={`w-full ${primaryColor}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Mail className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Sign In with Email
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      {session.status == 'authenticated' && JSON.stringify(session)}
      {session.status == 'authenticated' && (
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={async () => await signOut()}
        >
          signout
        </Button>
      )}
      <CardFooter>
        <p className="text-center text-sm text-gray-600 mt-2 w-full">
          Don&apos;t have an account?{' '}
          <a className="text-blue-600 hover:underline" href="/sign-up">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
