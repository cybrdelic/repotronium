import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaExclamationTriangle, FaSignInAlt, FaHome } from 'react-icons/fa';

export default function AuthError() {
    const router = useRouter();
    const { error } = router.query;

    // Map error codes to user-friendly messages
    const getErrorMessage = () => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration. Please contact support.';
            case 'AccessDenied':
                return 'You do not have permission to sign in.';
            case 'Verification':
                return 'The verification link was invalid or has expired.';
            case 'OAuthSignin':
                return 'Error in the OAuth sign-in process. Please try again.';
            case 'OAuthCallback':
                return 'Error in the OAuth callback process. Please try again.';
            case 'OAuthCreateAccount':
                return 'Could not create an OAuth account. Please try again.';
            case 'EmailCreateAccount':
                return 'Could not create an email account. Please try again.';
            case 'Callback':
                return 'Error in the callback handler. Please try again.';
            case 'OAuthAccountNotLinked':
                return 'This email is already associated with another account. Sign in with the correct provider.';
            case 'SessionRequired':
                return 'You must be signed in to access this page.';
            default:
                return 'An unknown error occurred during authentication. Please try again.';
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-cyber-dark p-8 rounded-lg border border-cyber-gray text-center">
                <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
                <p className="text-red-300 mb-6">{getErrorMessage()}</p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        href="/api/auth/signin"
                        className="bg-cyber-gray hover:bg-gray-700 transition duration-150 text-white py-2 px-6 rounded-md flex items-center justify-center gap-2"
                    >
                        <FaSignInAlt /> Try Again
                    </Link>
                    <Link
                        href="/"
                        className="bg-cyber-purple hover:bg-purple-700 transition duration-150 text-white py-2 px-6 rounded-md flex items-center justify-center gap-2"
                    >
                        <FaHome /> Go Home
                    </Link>
                </div>

                <div className="mt-6 text-sm text-gray-400">
                    <p>If you continue to experience issues, try clearing your browser cookies or contact support.</p>
                </div>
            </div>
        </div>
    );
}
