import { useState, useEffect } from 'react'
import SignIn from './components/SignIn'
import { supabase } from './supabaseClient'
import Username from './components/Username'
import styles from './App.module.css'

function App() {
  const [session, setSession] = useState(null)
  const [userSigningIn, setUserSigningIn] = useState(true)
  
  // fetch session on load
  useEffect(() => {
    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) console.error(error)
      setSession(session)
      setUserSigningIn(!session)
    }
    getSession()

    // listen for auth state changes
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
          <h1>Welcome!</h1>
          <Username session={session} />
          <button onClick={signOut}>Log out</button>
        </>
      )}
    </div>
  )
}

export default App
