import { useEffect } from 'react'
import SignIn from './support-components/SignIn'
import styles from './App.module.css'
import { useNavigate } from 'react-router-dom'

function App({session, setSession, userSigningIn, setUserSigningIn}) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!userSigningIn && session) {
      navigate('/home')
    }
  }, [userSigningIn, session, navigate])

  return (
    <div className={styles.everything_container}>
      <h1 className={styles.title}>Workout Logger</h1>
      <SignIn session={session} setSession={setSession} setUserSigningIn={setUserSigningIn} />
    </div>
  )
}

export default App