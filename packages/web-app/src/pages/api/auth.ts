import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, login } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  try {
    if (method === 'POST') {
      const { action, email, password } = body;

      if (action === 'signup') {
        const user = await createUser(email, password);
        res.status(200).json({ user });
      } else if (action === 'login') {
        const { user, token } = await login(email, password);
        res.status(200).json({ user, token });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}