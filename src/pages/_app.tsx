import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0} // Disable periodic refetching to reduce errors
      refetchOnWindowFocus={false} // Disable refetching on window focus
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
