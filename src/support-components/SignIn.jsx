import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from '/src/styling/SignIn.module.css'
import googleLogo from '/src/assets/google-logo.png'
export default function SignIn({ session, setSession, setUserSigningIn }) {
  const [signingIn, setSigningIn] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) console.error(error.message)
    else {
      setSession(data.session)
      setUserSigningIn(false)
    }
  }

  async function googleSignIn() {
    const redirectTo =
  window.location.hostname === "localhost"
    ? "http://localhost:5173/"
    : "https://wahidahmed04.github.io/workout-logger/";
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: {
    redirectTo 
  } })
    if (error) console.error(error.message)
  }

  async function signUp(email, password, username) {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) {
      console.error(authError.message)
      return
    }

    const user = authData.user
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, username })
        .single()
      if (profileError) console.error(profileError.message)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) console.error(sessionError)
      else setSession(session)

      setUserSigningIn(false)
    }
  }

  return (
    <>
      {signingIn ? (
        <div className={styles.log_in_container}>
          <h1 className={styles.login}>Login</h1>
          
          <h3 className={styles.email_label}>Email</h3>
          <input className={styles.input}value={email} onChange={e => setEmail(e.target.value)} placeholder='Type your email'/>
          <h3 className={styles.password_label}>Password</h3>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Type your password'/>
          <button onClick={() => signIn(email, password)} className={styles.login_button}>LOGIN</button>
          <h2>OR</h2>
          <button className={styles.google_button}onClick={googleSignIn}>
            <img className={styles.google_img} src={googleLogo} alt="google image"/>
            <span className={styles.google_text}>Continue with Google</span>
            </button>
          <span className={styles.create}>Don't have an account? 
            <button className={styles.create_button}onClick={() => setSigningIn(false)}>Sign Up</button>
          </span>
          
        </div>
      ) : (
        <div className={styles.sign_up_container}>
          <h1 className={styles.login}>Sign Up</h1>
          <h3 className={styles.email_label}>Email</h3>
          <input className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder='Email adress...' />
          <h3 className={styles.password_label}>Password</h3>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Create a password...'/>
          <h3 className={styles.password_label}>Username</h3>
          <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder='Username...'/>
          <button onClick={() => signUp(email, password, username)} className={styles.login_button}>Create Account</button>
        </div>
      )}
    </>
  )
}
