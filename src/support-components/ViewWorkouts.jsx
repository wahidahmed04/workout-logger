import {useEffect, useState} from 'react'
import { supabase } from '../supabaseClient';
export default function ViewWorkouts({session, viewingWorkouts, setViewingWorkouts, userWorkouts, setUserWorkouts}) {
    const [workouts, setWorkouts] = useState([])
    const getUserWorkouts = async () => {
  const { data, error } = await supabase
    .from('workout_presets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  else {
    const newArray = data.map(item => ({
      id: item.id,         // make sure to keep the ID
      workout_name: item.name,
      exercises: []
    }));

    setWorkouts(newArray);
    await getUserExercises(newArray); // pass the updated array
  }
};

   const getUserExercises = async (newArray) => {
  const updatedArray = [...newArray]; // copy to mutate safely

  for (const workout of updatedArray) {
    const { data: exercisesData, error } = await supabase
      .from("preset_exercises")
      .select("*")
      .eq("preset_id", workout.id); // make sure workout.id is the preset_id

    if (error) console.error(error);
    else {
      workout.exercises = exercisesData.map(item => item.name);
    }
  }

  setWorkouts(updatedArray); // update state once after loop
  console.log(updatedArray)
};
const addToFavorites = async(name) => {
  const {data, error} = await supabase
  .from("favorite_exercises")
  .insert([{user_id: session.user.id, name}])
  if (error) console.error(error)
}
useEffect(() => {
getUserWorkouts();
}, [])
  return (
    <div>
        {workouts.map((workout, index) => (
            <div key={index}>
                <h1>{workout.workout_name}</h1>
                {workout.exercises.map((exercise, index) => (
                  <div key={index}>
                    <h3>{exercise}</h3>
                    <button onClick={() => addToFavorites(exercise)}>Add To Favorites</button>
                  </div>
                ))}
            </div>
        ))}
    </div>
  )
}
