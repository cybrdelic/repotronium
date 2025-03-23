import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';
import { useEffect } from 'react';
import Router from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  // Set up global error handler for session issues
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Reset any error states when navigating
      console.log(`App navigating to: ${url}`);
    };

    // Handle failed client-side navigations
    const handleRouteError = (err: Error, url: string) => {
      console.error(`Navigation error to ${url}:`, err);

      // If it's an authentication error, redirect to sign in
      if (err.message.includes('unauthorized') || err.message.includes('authentication')) {
        Router.push('/api/auth/signin');
      }
    };

    Router.events.on('routeChangeStart', handleRouteChange);
    Router.events.on('routeChangeError', handleRouteError);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
      Router.events.off('routeChangeError', handleRouteError);
    };
  }, []);

  return (
    <SessionProvider
      session={pageProps.session}
      // Disable auto refresh to prevent session issues during development
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <Head>
        <title>Repotronium - Code Analysis & Documentation System</title>
        <meta name="description" content="Analyze GitHub repositories to generate comprehensive documentation, insights, and recommendations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
