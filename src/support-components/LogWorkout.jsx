import {useState} from 'react'
import { supabase } from '../supabaseClient'
export default function LogWorkout({session, loggingWorkout, setLoggingWorkout, userWorkouts, setUserWorkouts}) {
  const [selectedId, setSelectedId] = useState('')
  const [exercises, setExercises] = useState([])
  async function handleSelectWorkout(id) {
  setSelectedId(id);
  await fetchExercises(id);
}
  async function fetchExercises(presetId) {
  const { data, error } = await supabase
    .from('preset_exercises')
    .select('*')
    .eq('preset_id', presetId)
  if (error) {
    console.error('Error fetching workouts:', error);
  } else {
    setExercises(data);
  }
}

  return (
    <>
    <h1>Choose a workout</h1>
    <div>
    <h2>Select a workout to log</h2>
    {userWorkouts.length === 0 ? (
      <p>No workouts yet. Create one first!</p>
    ) : (
      userWorkouts.map(workout => (
        <button 
          key={workout.id} 
          onClick={() => handleSelectWorkout(workout.id)}
        >
          {workout.name}
        </button>
      ))
    )}
  </div>
    </>
  )
}
