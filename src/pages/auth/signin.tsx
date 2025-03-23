import { getProviders, signIn } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import { FaGithub } from 'react-icons/fa';

type Provider = {
  id: string;
  name: string;
  type: string;
};

type SignInProps = {
  providers: Record<string, Provider>;
};

export default function SignIn({ providers }: SignInProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-cyber-dark p-8 rounded-lg border border-cyber-gray text-center">
        <h1 className="text-2xl font-bold mb-6">Sign in to Repotronium</h1>
        <p className="text-gray-400 mb-8">
          Connect with your GitHub account to analyze your repositories and generate documentation.
        </p>
        
        {Object.values(providers).map((provider) => (
          <div key={provider.name} className="mb-4">
            <button
              onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 bg-cyber-gray hover:bg-gray-700 transition-colors py-3 px-4 rounded-md text-white font-medium"
            >
              {provider.id === 'github' && <FaGithub className="text-xl" />}
              Sign in with {provider.name}
            </button>
          </div>
        ))}
        
        <p className="text-gray-500 text-sm mt-6">
          We only request read access to your repositories to analyze their structure and generate documentation.
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  
  return {
    props: { providers: providers ?? {} },
  };
}
