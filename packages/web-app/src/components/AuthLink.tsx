import { useState, useEffect } from 'react';
import Link from 'next/link';

function AuthLink() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  function handleSignOut() {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  }

  return isAuthenticated ? (
    <button onClick={handleSignOut}>Sign Out</button>
  ) : (
    <Link href="/signup">
      <div>Sign Up / Login</div>
    </Link>
  );
}

export default AuthLink;