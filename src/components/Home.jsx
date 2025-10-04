import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {useState, useEffect} from 'react'
export default function Home({session, userSigningIn, setUserSigningIn}) {
  const [username, setUsername] = useState('')
  const [accountAge, setAccountAge] = useState(null)
  useEffect(() => {
  if (!session?.user) return

  async function fetchProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, created_at')
      .eq('id', session.user.id)
      .single()

    if (error) console.error('Error fetching profile:', error)
    else {
      setUsername(data.username)
      const createdAt = new Date(data.created_at);
    const now = new Date();
    const diffMs = now - createdAt; // difference in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convert ms to days

    setAccountAge(diffDays);
    }
  }

  fetchProfile()
}, [session])
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error.message)
    else setUserSigningIn(true)
  }
  
  const navigate = useNavigate()

  useEffect(() => {
    if (userSigningIn) {
      navigate('/') // automatically go to home when user is signed in
    }
  }, [userSigningIn, navigate])
  return (
    <>
    
    <h1>Homepage</h1>
    <h1>Username: {username}</h1>
    <button onClick={signOut}>Log out</button>
    <h1>Account age: {accountAge} {accountAge === 1 ? "day" : "days"}</h1>
    <h1>Favorite exercises: </h1>
    <h1>Total number of workouts:</h1>
    <br/>
    <Link to="/logger">Log a workout</Link>
    <br/>
    <Link to="/history">View your workout history</Link>
    </>
  )
}
