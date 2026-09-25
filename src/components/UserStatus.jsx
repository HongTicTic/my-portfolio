// src/components/UserStatus.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function UserStatus() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    // Check for an existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

// Listen for auth changes (sign in, sign out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

// Cleanup: unsubscribe when component unmounts
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

if (loading) return <p className="p-4">Checking auth...</p>;

if (session) {
    return (
      <p className="p-4 text-green-600">
        Logged in as: {session.user.email}
      </p>
    );
  }

return <p className="p-4 text-gray-500">Not logged in</p>;
}

export default UserStatus;