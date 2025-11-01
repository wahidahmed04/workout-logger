import { Link, useNavigate } from "react-router-dom"
import Navbar from "../support-components/Navbar"
import { useState, useEffect } from 'react'
import styles from '/src/styling/WorkoutLogger.module.css'
import { supabase } from '../supabaseClient';
import LogWorkout from "../support-components/LogWorkout";
import ViewWorkouts from "../support-components/ViewWorkouts";
export default function WorkoutLogger({ session, userSigningIn, setUserSigningIn }) {
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [exercises, setExercises] = useState([{ name: "", query: "", selected: false }]);
  const [results, setResults] = useState([[]]); // array of arrays for search results
  const [workoutName, setWorkoutName] = useState("");
  const [addError, setAddError] = useState("");
  const [createError, setCreateError] = useState("")
  const [loggingWorkout, setLoggingWorkout] = useState(false)
  const [viewingWorkouts, setViewingWorkouts] = useState(false)
  const [username, setUsername] = useState("")
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
    }
  }

  fetchProfile()
}, [session])
  // search effect
  useEffect(() => {
    async function searchExercises() {
      const newResults = [];

      for (const exercise of exercises) {
        if (!exercise.query || exercise.selected) {
          newResults.push([]);
          continue;
        }

        const normalizedQuery = exercise.query.toLowerCase();

        // Phase 1: starts with query
        let { data: startMatches, error: startError } = await supabase
          .from("exercise_catalog")
          .select("*")
          .ilike("name", `${normalizedQuery}%`)
          .limit(3);

        if (startError) {
          console.error("Supabase error:", startError);
          newResults.push([]);
          continue;
        }

        // Phase 2: contains query
        if (startMatches.length < 3) {
          const { data: containsMatches, error: containsError } = await supabase
            .from("exercise_catalog")
            .select("*")
            .ilike("name", `%${normalizedQuery}%`)
            .limit(3);

          if (!containsError) {
            const combined = [...startMatches];
            for (const ex of containsMatches) {
              if (!combined.find(item => item.id === ex.id)) combined.push(ex);
              if (combined.length === 3) break;
            }
            startMatches = combined;
          }
        }

        newResults.push(startMatches);
      }

      setResults(newResults);
    }

    searchExercises();
  }, [exercises]);

  function handleSelectExercise(index, name) {
    for(let i = 0; i < exercises.length; i++){
      if(exercises[i].name === name){
        return
      }
    }
    const newExercises = [...exercises];
    newExercises[index].name = name;
    newExercises[index].query = name;
    newExercises[index].selected = true;
    setExercises(newExercises);
  }

  function handleAddExercise() {
  const hasIncomplete = exercises.some(
    (ex) => ex.query.trim() !== "" && !ex.selected
  );
  if (hasIncomplete) {
    setAddError("Please finish selecting all exercises before adding a new one.");
    return;
  }
  setAddError("");
  setExercises([...exercises, { name: "", query: "", selected: false }]);
  setResults([...results, []]);
}

  function handleCreateWorkout() {
  // check for incomplete exercises
  const hasIncomplete = exercises.some(
    (ex) => ex.query.trim() !== "" && !ex.selected
  );
  if (hasIncomplete) {
    setCreateError("Please finish selecting all exercises before creating the workout.");
    return;
  }

  // check if at least one exercise is selected
  const validExercises = exercises.filter((ex) => ex.selected);
  if (validExercises.length === 0) {
    setCreateError("At least one exercise must be added.");
    return;
  }

  // require a workout name
  if (!workoutName || workoutName.trim() === "") {
    setCreateError("Please enter a workout name.");
    return;
  }

  setCreateError("");
  addWorkout(); // continue with your existing workout creation function
}

async function addWorkout() {
  
  const { data, error } = await supabase
    .from('workout_presets')
    .insert([{ user_id: session.user.id, name: workoutName }])
    .select('id')
    .single(); // directly get the new workout ID

  if (error) {
    if (error.code === '23505') {
      setCreateError('You already have a workout with this name.');
    } else {
      setCreateError('Something went wrong while creating the workout.');
    }
    console.error('Insert error:', error);
    return;
  }

  const presetId = data.id;

  // ✅ Wait for all inserts to finish
  await Promise.all(
    exercises
      .filter(ex => ex.name.trim() !== "")
      .map(async (exercise) => {
        const { error: insertError } = await supabase
          .from('preset_exercises')
          .insert([{ preset_id: presetId, name: exercise.name }]);
        if (insertError) console.error(`Error inserting ${exercise.name}:`, insertError);
      })
  );

  // Reset modal state
  setShowModal(false);
  setWorkoutName("");
  setExercises([{ name: "", query: "", selected: false }]);
  setCreateError("");
  setAddError("");
}


function handleCancel(){
  setShowModal(false);
  setExercises([{ name: "", query: "", selected: false }]);
  setResults([[]]); // array of arrays for search results
  setWorkoutName("");
  setAddError("");
  setCreateError("")
}
async function fetchUserWorkouts() {
  const { data, error } = await supabase
    .from('workout_presets')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workouts:', error);
  } else {
    setUserWorkouts(data);
  }
}
function handleRemove(index){
  setExercises(exercises.filter((_, i) => i !== index))
}
  return (
    loggingWorkout ? (
      <LogWorkout session={session} loggingWorkout={loggingWorkout} setLoggingWorkout={setLoggingWorkout}
      userWorkouts={userWorkouts} setUserWorkouts={setUserWorkouts} userSigningIn={userSigningIn} setUserSigningIn={setUserSigningIn}
      />
    ) : viewingWorkouts ? (
      <ViewWorkouts session={session} viewingWorkouts={viewingWorkouts} setViewingWorkouts={setViewingWorkouts}
      userWorkouts={userWorkouts} setUserWorkouts={setUserWorkouts}/>
    ) : (
    <div className={styles.all_container}>
      <div className={styles.dash_container}>
          <h1 className={styles.title}>Workout Logger</h1>
          <h1 className={styles.username}>@{username}</h1>
          <button onClick={signOut} className={styles.log_out_button}>Log out</button>
          </div>
      <div className={styles.buttons_container}>
      <button className={styles.button} onClick={() => {fetchUserWorkouts(); setViewingWorkouts(true)}}>View Workout Presets</button>
      <button className={styles.button} onClick={() => { 
  fetchUserWorkouts();
  setLoggingWorkout(true);
}}>Log a workout</button>
      <button className={styles.button} onClick={() => setShowModal(true)}>Create a new workout</button>
      </div>
      {showModal && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <button className={styles.cancel_button} onClick={handleCancel}> {'<'} Cancel</button>
            <h2 className={styles.modal_title}>Create New Workout</h2>
            <div className={styles.modal_form_container}>
            <label className={styles.modal_label} htmlFor="workout_name">Workout name:</label>
            <input className={styles.name_input} id="workout_name"
              value={workoutName}
              onChange={(e) => { setWorkoutName(e.target.value); if (createError) setCreateError(""); }}
            />
            </div>
            <br />

            {exercises.map((exercise, index) => (
              <div key={index} className={styles.modal_form_container}>
                <label className={styles.modal_label}>Exercise {index + 1}:</label>
                <input className={styles.exercise_input}
                  type="text"
                  value={exercise.query}
                  onChange={(e) => {
                    const newExercises = [...exercises];
                    newExercises[index].query = e.target.value;
                    newExercises[index].selected = false; // allow new search
                    setExercises(newExercises);
                  }}
                />
                <button className={styles.remove_button} onClick={() => handleRemove(index)}>Remove</button>


                {!exercise.selected && results[index]?.length > 0 && (
                <div className={styles.search_results}>
                    {results[index].map((result) => (
                        <button className={styles.exercise_results} type="button" onClick={() => handleSelectExercise(index, result.name)}>
                          {result.name}
                        </button>
                    ))}
                  </div>
                )}
                <br />
              </div>
            ))}

            {addError && <h1 style={{ color: 'red', fontSize: "23px" }}>{addError}</h1>}

            <button className={styles.add_button} type="button" onClick={handleAddExercise}>Add Exercise</button>
            <br /><br />
            {createError && <h1 style={{ color: 'red', fontSize: "23px" }}>{createError}</h1>}
            <div className={styles.create_cancel_container}>
            <button className={styles.create_button} type="button" onClick={() => {handleCreateWorkout()}}>Create Workout</button>
            
            </div>
          </div>
        </div>
      )}
      <Navbar />
    </div>
    )
  );
}
