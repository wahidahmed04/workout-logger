import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Username({ session }) {
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

  return <div>Username: {username}</div>
}
