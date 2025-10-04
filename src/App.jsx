import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SignIn from './components/SignIn'
import { supabase } from './supabaseClient'
import styles from './App.module.css'
import { Link } from 'react-router-dom'

function App() {
  const [session, setSession] = useState(null)
  const [userSigningIn, setUserSigningIn] = useState(true)

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

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error.message)
    else setUserSigningIn(true)
  }

  return (
    <div className={styles.everything_container}>
      <h1 className={styles.title}>Workout Logger</h1>

      {userSigningIn ? (
        <SignIn session={session} setSession={setSession} setUserSigningIn={setUserSigningIn} />
      ) : (
        <>
          <button onClick={signOut}>Log out</button>
          <Link to="/home">Go to home</Link>
        </>
      )}
    </div>
  )
}

export default App
