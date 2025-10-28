import { useState, useEffect } from 'react'
import SignIn from './support-components/SignIn'
import { supabase } from './supabaseClient'
import styles from './App.module.css'
import { Link, useNavigate} from 'react-router-dom'

function App({session, setSession, userSigningIn, setUserSigningIn}) {

  const navigate = useNavigate()

  // Handle Supabase redirect hash for both localhost and GitHub Pages
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const queryString = hash.substring(1) // remove the #
      const params = new URLSearchParams(queryString)

      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      supabase.auth.setSession({
        access_token,
        refresh_token,
      }).then(() => {
        // Detect if on localhost or GitHub Pages
        const isLocalhost = window.location.hostname === 'localhost'
        if (isLocalhost) {
          window.location.hash = '' // just clear the hash locally
        } else {
          // On GitHub Pages, redirect to repo root with hash routing
          window.location.href = '/workout-logger/#/'
        }
      })
    }
  }, [])

  useEffect(() => {
    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) console.error(error)
      setSession(session)
      setUserSigningIn(!session)
    }
    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUserSigningIn(!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userSigningIn) {
      navigate('/home') // automatically go to home when user is signed in
    }
  }, [userSigningIn, navigate])

  return (
    <div className={styles.everything_container}>
      <h1 className={styles.title}>Workout Logger</h1>
      <SignIn session={session} setSession={setSession} setUserSigningIn={setUserSigningIn} />
    </div>
  )
}

export default App
