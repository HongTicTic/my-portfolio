// src/components/AuthForm.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for a confirmation link!");
    }
  };

const handleSignIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Signed in successfully!");
    }
  };

const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

return (
    <div className="max-w-sm mx-auto p-8 space-y-4">
      <h2 className="text-2xl font-bold text-center">Welcome</h2>

<input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border rounded p-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border rounded p-2"
      />

<div className="flex gap-2">
        <button
          onClick={handleSignUp}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign Up
        </button>
        <button
          onClick={handleSignIn}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
      </div>

<button
        onClick={handleSignOut}
        className="w-full bg-gray-300 px-4 py-2 rounded"
      >
        Sign Out
      </button>

{message && <p className="text-center text-sm mt-4">{message}</p>}
    </div>
  );
}

export default AuthForm;