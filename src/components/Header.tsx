import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaGithub, FaCog } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Clear any local storage or session storage items if you're using them
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }

    // Sign out with explicit redirect to ensure proper navigation
    await signOut({
      redirect: true,
      callbackUrl: '/'
    });
  };

  return (
    <header className="bg-cyber-dark py-4 border-b border-cyber-gray">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          <span className="cyber-text-gradient">Repotronium</span>
        </Link>

        <nav className="flex items-center gap-6">
          {status === 'authenticated' && session ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-cyber-highlight transition duration-150"
              >
                Dashboard
              </Link>
              <Link
                href="/config"
                className="text-gray-300 hover:text-cyber-highlight transition duration-150 flex items-center"
              >
                <FaCog className="mr-1" /> Config
              </Link>
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user?.name || 'User'}
                    className="w-8 h-8 rounded-full border border-cyber-gray"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-400 hover:text-white transition duration-150"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="flex items-center gap-2 bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white py-2 px-4 rounded-md"
            >
              <FaGithub className="text-xl" />
              Sign in with GitHub
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
