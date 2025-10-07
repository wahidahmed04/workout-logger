import {useState, useEffect} from 'react'
import { supabase } from '../supabaseClient'
import styles from '/src/styling/LogWorkout.module.css'
export default function LogWorkout({session, loggingWorkout, setLoggingWorkout, userWorkouts, setUserWorkouts}) {
  const [selectedId, setSelectedId] = useState('')
  const [exercises, setExercises] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState('')
  const [numSets, setNumSets] = useState([])
  const [exerciseElementList, setExerciseElementList] = useState([])
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
    setNumSets(Array(data.length).fill(1))
    console.log(data)
    setShowModal(true)
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
          onClick={() => {setSelectedWorkout(workout.name); handleSelectWorkout(workout.id)}}
        >
          {workout.name}
        </button>
      ))
    )}
  </div>
  {showModal && (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <h1>{selectedWorkout}</h1>
        {exercises.map((exercise, index) => (
  <div key={index}>
    <h2>{exercise.name}</h2>

    {/* Render input boxes for each set */}
    {[...Array(numSets[index])].map((_, setIndex) => (
      <div key={setIndex}>
        <input
          type="number"
          placeholder="Reps"
          name={`reps-${index}-${setIndex}`}
        />
        <input
          type="number"
          placeholder="Weight"
          name={`weight-${index}-${setIndex}`}
        />
      </div>
    ))}

    {/* Add Set Button */}
    <button
      onClick={() => {
        const newNumSets = [...numSets];
        newNumSets[index] += 1;
        setNumSets(newNumSets);
      }}
    >
      Add Set
    </button>
  </div>
))}

      </div>
    </div>
  )}
    </>
  )
}
