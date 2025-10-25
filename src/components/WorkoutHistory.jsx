import { Link } from 'react-router-dom'
import Navbar from '../support-components/Navbar'
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from '/src/styling/WorkoutHistory.module.css'
export default function WorkoutHistory() {
    const [session, setSession] = useState(null);
    const [workouts, setWorkouts] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedWorkout, setSelectedWorkout] = useState("")
    const [exercises, setExercises] = useState([])
    const [exerciseIds, setExerciseIds] = useState({})
    const [sets, setSets] = useState({})
    const getUserWorkouts = async () => {
  if (!session?.user?.id) return;

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  else setWorkouts(data);
};

  
  const getUserExercises = async (workoutId) => {
      const { data: exercisesData, error } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workoutId); 
      if(error) return console.error(error)
      else setExercises(exercisesData)
      const temp = []
      for (const item of exercisesData) {
        const newObj = {}
        newObj[item.id] = item.name
        temp.push(newObj)
      }
      setExerciseIds(temp)
      const newObject = {};

      for (const item of exercisesData) {
        const key = item.name;

        // If this exercise name hasn't been added yet, initialize it as an empty array
        if (!newObject[key]) {
          newObject[key] = [];
        }
      }
      getUserSets(newObject, temp)

  };
const getUserSets = async(sets, temp) => {
  for (const obj of temp) {
  const [id] = Object.keys(obj);
  const name = obj[id];

  const { data, error } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("exercise_id", id);

  if (error) console.error(error);
  else {
    for (const item of data) {
      sets[name].push({ setNumber: item.set_number, reps: item.reps, weight: item.weight });
    }
  }
}
setSets(sets); // ✅ only once, after all exercises are processed
}
useEffect(() => {
  const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error(error);
    else setSession(session);
  };
  getSession();
}, []); // only runs once
useEffect(() => {
  if (session?.user?.id) {
    getUserWorkouts();
  }
}, [session]); // runs once when session is set


  return (
    <>
    <h1>Workout History</h1>
    <h2>Select a workout to view</h2>
    {workouts.map((workout, index) => (
      <div key={index}>
      <button onClick={() => {getUserExercises(workout.id);
      setSelectedWorkout(workout);setShowModal(true);}
      }>{workout.name}</button>
      <br/>
      </div>
    ))}
    {showModal && (
            <div className={styles.modal_overlay}>
              <div className={styles.modal_content}>
                <button onClick={() => {setExercises([]); setSets({})
                  setSelectedWorkout(""); setShowModal(false);}
                }>Go back</button>
                <h1>Workout name: {selectedWorkout.name}</h1>
                <h2>Workout exercises: </h2>
                {exercises.map((exercise, index) => {
                  const name = exercise.name
                  const tempList = sets[name]
                  return (
                  <div key={index}>
                  <h3 key={index}>{name}</h3>
                  {Array.isArray(tempList) && tempList.map((obj, index) => (
                    <div key={index}>
                      <ul>Set: {obj.setNumber}, Reps: {obj.reps}, Weight: {obj.weight}</ul>
                    </div>
                  ))}
                  </div>
                  )
})}
              </div>
            </div>
          )}
    <Navbar/>
    </>
  )
}