import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {useState, useEffect} from 'react'
export default function Home({session}) {
  const [username, setUsername] = useState('')
    useEffect(() => {
    if (!session?.user) return

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (error) console.error('Error fetching profile:', error)
      else setUsername(data.username)
    }

    fetchProfile()
  }, [session])
  return (
    <>
    <h1>Homepage</h1>
    <Link to="/">Go back</Link>
    <h1>Username: {username}</h1>
    </>
  )
}
