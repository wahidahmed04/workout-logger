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
  const [currPresetId, setCurrPresetId] = useState("")
  const [currPresetName, setCurrPresetName] = useState("")
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
    
    setCurrPresetId(presetId)
    const { data: presetData, error: presetError } = await supabase
  .from('workout_presets')
  .select('name')
  .eq('id', presetId);

if (presetError) console.error(presetError);
else setCurrPresetName(presetData[0].name);
    const newList = data.map(exercise => ({
  name: exercise.name,
  sets: [{ set: 1, reps: "", weight: "" }],
  id: null
}));
setExerciseElementList(newList);

    setShowModal(true)    

  }
}
const handleLogWorkout = async () => {
  try {
    const workoutId = await addToWorkout();
    const updatedExercises = await addToExercises(workoutId); // get the updated list back
    await addToSets(updatedExercises); // pass it in
    console.log("Workout logged successfully");
  } catch (err) {
    console.error("Error logging workout:", err);
  }
};

const addToSets = async (exerciseList) => {
  for (const exercise of exerciseList) {
    for (const currSet of exercise.sets) {
      const { data, error } = await supabase
        .from("workout_sets")
        .insert([{
          exercise_id: exercise.id,
          set_number: currSet.set,
          reps: currSet.reps,
          weight: currSet.weight
        }]);
      if (error) throw error;
    }
  }
};

const addToExercises = async (workoutId) => {
  let updatedList = [...exerciseElementList];

  for (const exercise of exercises) {
    const { data: exerciseData, error } = await supabase
      .from("workout_exercises")
      .insert([{ workout_id: workoutId, name: exercise.name }])
      .select()
      .single();

    if (error) throw error;

    updatedList = updatedList.map(prev =>
      prev.name === exercise.name
        ? { ...prev, id: exerciseData.id }
        : prev
    );
  }

  setExerciseElementList(updatedList);
  return updatedList; // ✅ return the updated array to use immediately
};  
const addToWorkout = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .insert([{ user_id: session.user.id, preset_id: currPresetId, name: currPresetName }])
    .select()  // <-- return the inserted row
    .single(); // <-- only one row expected
  if (error) throw error; // throw to be caught in handleLogWorkout
  return data.id;          // <-- return the workout id
}
const changeReps = (e, exerciseIndex, setIndex) => {
  const newList = [...exerciseElementList];
  newList[exerciseIndex].sets[setIndex].reps = e.target.value;
  setExerciseElementList(newList);
};

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
        <button onClick={() => {setShowModal(false); setExerciseElementList([]); 
          setCurrPresetId(""); setCurrPresetName("");
        }}>Cancel</button>
        {exerciseElementList.map((exercise, index) => (
  <div key={index}>
    <h2>{exercise.name}</h2>
    {exercise.sets.map((set, setIndex) => (
      <div key={setIndex}>
        <input
          type="number"
          placeholder="Reps"
          value={set.reps}
          onChange={e => {changeReps(e, index, setIndex); console.log(exerciseElementList);}}
        />
        <input
          type="number"
          placeholder="Weight"
          value={set.weight}
          onChange={e => {
            const newList = [...exerciseElementList];
            newList[index].sets[setIndex].weight = e.target.value;
            setExerciseElementList(newList);
            console.log(exerciseElementList)
          }}
        />
      </div>
    ))}
    <button
      onClick={() => {
        const newList = [...exerciseElementList];
        const nextSetNumber = newList[index].sets.length + 1;
        newList[index].sets.push({ set: nextSetNumber, reps: "", weight: "" });
        setExerciseElementList(newList);
      }}
    >
      Add Set
    </button>
  </div>
))}

<button onClick={handleLogWorkout}>Add workout</button>
      </div>
    </div>
  )}
    </>
  )
}
