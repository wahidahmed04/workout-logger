import { Link } from "react-router-dom"
import Navbar from "../support-components/Navbar"
import { useState, useEffect } from 'react'
import styles from '/src/styling/WorkoutLogger.module.css'
import { supabase } from '../supabaseClient';

export default function WorkoutLogger({ session }) {
  const [showModal, setShowModal] = useState(false);
  const [exercises, setExercises] = useState([{ name: "", query: "", selected: false }]);
  const [results, setResults] = useState([[]]); // array of arrays for search results
  const [workoutName, setWorkoutName] = useState("");
  const [addError, setAddError] = useState("");
  const [createError, setCreateError] = useState("")
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
          .limit(5);

        if (startError) {
          console.error("Supabase error:", startError);
          newResults.push([]);
          continue;
        }

        // Phase 2: contains query
        if (startMatches.length < 5) {
          const { data: containsMatches, error: containsError } = await supabase
            .from("exercise_catalog")
            .select("*")
            .ilike("name", `%${normalizedQuery}%`)
            .limit(5);

          if (!containsError) {
            const combined = [...startMatches];
            for (const ex of containsMatches) {
              if (!combined.find(item => item.id === ex.id)) combined.push(ex);
              if (combined.length === 5) break;
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
    const newExercises = [...exercises];
    newExercises[index].name = name;
    newExercises[index].query = name;
    newExercises[index].selected = true;
    setExercises(newExercises);
  }

  function handleAddExercise() {
    const allFilled = exercises.every(ex => ex.name.trim() !== "");
    if (!allFilled) {
      setAddError("Please fill in all current exercises before adding a new one.");
      return;
    }
    setAddError("");
    setExercises([...exercises, { name: "", query: "", selected: false }]);
    setResults([...results, []]);
  }
  function handleCreateWorkout(){
    if(!workoutName){
      setCreateError("Workout name cannot be left empty")
      return
    }
    if(exercises.length === 1){
      if(JSON.stringify(exercises[0]) === JSON.stringify({ name: "", query: "", selected: false })){
        setCreateError("At least one exercise must be added")
        return
      }
    }
    setCreateError("")
    addWorkout()
  }
  async function addWorkout(){
    
    const { data, error } = await supabase
      .from('workout_presets')
      .insert([
        {
          user_id: session.user.id,
          name: workoutName
        }
      ])
    
  if (error) {
    if (error.code === '23505') {
      setCreateError('You already have a workout with this name.');
    } else {
      setCreateError('Something went wrong while creating the workout.');
    }
    console.error('Insert error:', error);
    return;
  }
    else {
    await addExercises()
    setShowModal(false)
    setWorkoutName("")
  }
  }
async function addExercises(){
  const { data: presetData, error } = await supabase
  .from('workout_presets')
  .select('id')
  .eq('name', workoutName)
  .single()

if (error) {
  console.error('Error fetching preset_id:', error)
  return
}
const preset_id = presetData.id
  for(const exercise of exercises){
    if(exercise.name){
    const { data, error } = await supabase
      .from('preset_exercises')
      .insert([
        {
          preset_id,
          name: exercise.name
        }
      ])
  }
}
}
  return (
    <>
      <h1>Workout Logger</h1>
      <button>Workouts</button>
      <button>Log a workout</button>
      <button onClick={() => setShowModal(true)}>Create a new workout</button>

      {showModal && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <h2>Create New Workout</h2>
            <label>Workout name:</label>
            <input
              placeholder="Workout name..."
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
            <br /><br />

            {exercises.map((exercise, index) => (
              <div key={index}>
                <label>Exercise {index + 1}:</label>
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={exercise.query}
                  onChange={(e) => {
                    const newExercises = [...exercises];
                    newExercises[index].query = e.target.value;
                    newExercises[index].selected = false;
                    setExercises(newExercises);
                  }}
                  style={{ width: '300px', padding: '5px' }}
                />

                {!exercise.selected && results[index]?.length > 0 && (
                  <ul className={styles.search_results}>
                    {results[index].map((result) => (
                      <li key={result.id}>
                        <button type="button" onClick={() => handleSelectExercise(index, result.name)}>
                          {result.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <br />
              </div>
            ))}

            {addError && <p style={{ color: 'red' }}>{addError}</p>}

            <button type="button" onClick={handleAddExercise}>Add Exercise</button>
            <br /><br />
            <button type="button" onClick={() => {handleCreateWorkout()}}>Create Workout</button>
            {createError && <p style={{ color: 'red' }}>{createError}</p>}
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
}
