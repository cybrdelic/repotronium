import { useSession, getSession } from 'next-auth/react';
import { NextPageContext } from 'next';
import RepoList from '@/components/RepoList';

export default function Dashboard() {
  const { data: session } = useSession({ required: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Repositories</h1>
        <p className="text-gray-400">
          Select a repository to analyze and generate documentation.
        </p>
      </div>
      
      <RepoList />
    </div>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}
