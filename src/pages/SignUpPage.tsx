
import React, { useState } from 'react';

export default function SignUpPage({ onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input type="email" placeholder="Email" className="border p-2 mb-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="border p-2 mb-2 w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-green-600 text-white px-4 py-2 w-full" onClick={() => onSignUp(email, password)}>Create Account</button>
    </div>
  );
}
