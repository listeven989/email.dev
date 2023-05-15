import { useState, ChangeEvent, FormEvent } from 'react';
import { createUser } from '../auth/auth';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const user = await createUser(email, password);
      console.log('User created successfully:', user);
    } catch (error: any) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Signup</button>
      </form>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default Signup;