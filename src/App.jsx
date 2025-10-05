import { useState, useEffect } from 'react'
import SignIn from './support-components/SignIn'
import { supabase } from './supabaseClient'
import styles from './App.module.css'
import { Link, useNavigate} from 'react-router-dom'

function App({session, setSession, userSigningIn, setUserSigningIn}) {

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


  const navigate = useNavigate()

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
