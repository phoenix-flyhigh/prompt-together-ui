import { useEffect } from 'react';
import { useRouter } from 'next/router';

const SessionRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // Redirect to home page
  }, [router]);

  return null // Prevent flashing content during redirection
};

export default SessionRedirect;
