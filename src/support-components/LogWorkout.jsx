import {useState, useEffect} from 'react'
import { supabase } from '../supabaseClient'
import styles from '/src/styling/LogWorkout.module.css'
import Navbar from './Navbar'
export default function LogWorkout({session, loggingWorkout, setLoggingWorkout, userWorkouts, setUserWorkouts, userSigningIn, setUserSigningIn}) {
  const [selectedId, setSelectedId] = useState('')
  const [exercises, setExercises] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState('')
  const [numSets, setNumSets] = useState([])
  const [exerciseElementList, setExerciseElementList] = useState([])
  const [currPresetId, setCurrPresetId] = useState("")
  const [currPresetName, setCurrPresetName] = useState("")
  const [username, setUsername] = useState("")
  
  useEffect(() => {
    const fetchUsername = async () => {
      const { data, error } = await supabase

        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
      if (error) {
        console.error('Error fetching username:', error);
      } else {
        setUsername(data.username);
      }
    };
    fetchUsername();
  }, [session]);
  async function handleSelectWorkout(id) {
  setSelectedId(id);
  await fetchExercises(id);
}
async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error.message)
    else setUserSigningIn(true)
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
  const hasEmptyFields = exerciseElementList.some(exercise =>
    exercise.sets.some(set => set.reps === "" || set.weight === "")
  );

  if (hasEmptyFields) {
    alert("Please fill in all reps and weight fields before logging your workout.");
    return;
  }
  try {
    const workoutId = await addToWorkout();
    const updatedExercises = await addToExercises(workoutId); // get the updated list back
    await addToSets(updatedExercises); // pass it in
    console.log("Workout logged successfully");
    setLoggingWorkout(false)
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
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', { 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
});
  return (
    <div className={styles.container}>
    <div className={styles.dash_container}>
    <h1 className={styles.title}>Workout Logger</h1>
    <h1 className={styles.username}>@{username}</h1>
    <button onClick={signOut} className={styles.log_out_button}>Log out</button>
    </div>
    <button onClick={() => setLoggingWorkout(false)} className={styles.back_button}> {"<"} Back</button>
    <h1 className={styles.date}>{formattedDate}</h1>
    <h2 className={styles.select_workout_header}>Select a workout to log</h2>

    <div className={styles.workout_selection_container}>
    {userWorkouts.length === 0 ? (
      <p className={styles.no_workout_message}>No workouts yet. Create one first!</p>
    ) : (
      userWorkouts.map(workout => (
        <button className={styles.workout_button}
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
        <button className={styles.back_button_second} onClick={() => {setShowModal(false); setExerciseElementList([]); 
          setCurrPresetId(""); setCurrPresetName("");
        }}>{'<'}  Back</button>
        <h1 className={styles.workout_name}>{selectedWorkout}</h1>
        
        {exerciseElementList.map((exercise, index) => (
  <div key={index} className={styles.exercise_container}>
    <h2 className={styles.exercise_name}>{exercise.name}</h2>
    <span className={styles.set_header}>Set</span>
    <span className={styles.rep_header}>Reps</span>
    <span className={styles.weight_header}>Weight</span>
    {exercise.sets.map((set, setIndex) => (
      <div key={setIndex}>
        <span className={styles.set_num}>{setIndex+1}</span>
        <div className={styles.input_spacer}>
        <input className={styles.rep_input}
          type="number"
          maxLength={4}
          value={set.reps}
          onChange={e => {
            if (e.target.value.length <= 4) {
            changeReps(e, index, setIndex);
            }
          }}
        />
        <span className={styles.separator}>|</span>
        <input className={styles.weight_input}
          type="number"
          maxLength={4}
          value={set.weight}
          onChange={e => {
            if (e.target.value.length <= 4) {
            const newList = [...exerciseElementList];
            newList[index].sets[setIndex].weight = e.target.value;
            setExerciseElementList(newList);
            }
          }}
        />
        </div>
      </div>
    ))}
    <button
  onClick={() => {
    const newList = [...exerciseElementList];
    if (newList[index].sets.length > 1) {
      newList[index].sets.pop();
      setExerciseElementList(newList);
    }
  }}
  disabled={exercise.sets.length <= 1}
  className={styles.remove_set_button}
>
  Remove Set
</button>
    <button className={styles.add_set_button}
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

<button onClick={handleLogWorkout} className={styles.add_workout_button}>Add workout</button>
      </div>
    </div>
  )}
  <Navbar/>
    </div>
  )
}
