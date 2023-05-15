import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    console.log(router.pathname)

    if (!token && router.pathname !== '/signup' && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router]);
}