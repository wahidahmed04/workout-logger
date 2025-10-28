import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import WorkoutHistory from './components/WorkoutHistory.jsx';
import WorkoutLogger from './components/WorkoutLogger.jsx';
import Home from './components/Home.jsx';
import { supabase } from './supabaseClient';

function Root() {
  const [session, setSession] = useState(null);
  const [userSigningIn, setUserSigningIn] = useState(true);

  useEffect(() => {
    // Handle OAuth redirects (works for both localhost and GitHub Pages)
    async function handleOAuthRedirect() {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const queryString = hash.substring(1);
        const params = new URLSearchParams(queryString);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        await supabase.auth.setSession({ access_token, refresh_token });
        
        // Clean up URL
        window.location.hash = '#/';
      }
    }

    handleOAuthRedirect();
  }, []);

  useEffect(() => {
    // Get initial session
    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      setSession(session);
      setUserSigningIn(!session);
    }
    getSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserSigningIn(!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const router = createHashRouter([
    { path: "/", element: <App session={session} setSession={setSession} userSigningIn={userSigningIn} setUserSigningIn={setUserSigningIn}/> },
    { path: "/logger", element: <WorkoutLogger session={session} userSigningIn={userSigningIn} setUserSigningIn={setUserSigningIn}/> },
    { path: "/history", element: <WorkoutHistory session={session} userSigningIn={userSigningIn} setUserSigningIn={setUserSigningIn}/> },
    { path: "/home", element: <Home session={session} userSigningIn={userSigningIn} setUserSigningIn={setUserSigningIn}/> },
  ]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);