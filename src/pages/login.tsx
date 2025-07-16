import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleEmailLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert('Logged in!');
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="block w-full mb-2 px-4 py-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="block w-full mb-4 px-4 py-2 border rounded"
      />

      <button onClick={handleEmailLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4">
        Login with Email
      </button>

      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded w-full">
        Login with Google
      </button>
    </div>
  );
}
