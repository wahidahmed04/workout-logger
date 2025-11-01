import {use, useEffect, useState} from 'react'
import { supabase } from '../supabaseClient';
import styles from '/src/styling/ViewWorkouts.module.css'
import Navbar from './Navbar';

export default function ViewWorkouts({session, viewingWorkouts, setViewingWorkouts, userWorkouts, setUserWorkouts}) {
    const [workouts, setWorkouts] = useState([])
    const [username, setUsername] = useState('')
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [favoriteExercises, setFavoriteExercises] = useState([]);
    
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
    
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) console.error(error.message)
        else setUserSigningIn(true)
    }
    
    const getUserWorkouts = async () => {
        const { data, error } = await supabase
            .from('workout_presets')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else {
            const newArray = data.map(item => ({
                id: item.id,
                workout_name: item.name,
                exercises: []
            }));

            setWorkouts(newArray);
            await getUserExercises(newArray);
        }
    };

    const getUserExercises = async (newArray) => {
        const updatedArray = [...newArray];

        for (const workout of updatedArray) {
            const { data: exercisesData, error } = await supabase
                .from("preset_exercises")
                .select("*")
                .eq("preset_id", workout.id);

            if (error) console.error(error);
            else {
                workout.exercises = exercisesData.map(item => item.name);
            }
        }

        setWorkouts(updatedArray);
        console.log(updatedArray)
    };
    
    const getFavoriteExercises = async () => {
        const { data, error } = await supabase
            .from("favorite_exercises")
            .select("name")
            .eq("user_id", session.user.id);
        
        if (error) console.error(error);
        else {
            setFavoriteExercises(data.map(item => item.name));
        }
    };
    
    const addToFavorites = async(name) => {
        const {data, error} = await supabase
            .from("favorite_exercises")
            .insert([{user_id: session.user.id, name}])
        
        if (error) console.error(error);
        else {
            // Update local state to reflect the change
            setFavoriteExercises(prev => [...prev, name]);
        }
    }
    
    const removeFromFavorites = async(name) => {
        const {error} = await supabase
            .from("favorite_exercises")
            .delete()
            .eq("user_id", session.user.id)
            .eq("name", name);
        
        if (error) console.error(error);
        else {
            // Update local state to reflect the change
            setFavoriteExercises(prev => prev.filter(exercise => exercise !== name));
        }
    }
    
    useEffect(() => {
        getUserWorkouts();
        getFavoriteExercises();
    }, [])
    
    const isFavorited = (exerciseName) => {
        return favoriteExercises.includes(exerciseName);
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.dash_container}>
                <h1 className={styles.title}>Workout Logger</h1>
                <h1 className={styles.username}>@{username}</h1>
                <button onClick={signOut} className={styles.log_out_button}>Log out</button>
            </div>
            <button onClick={() => setViewingWorkouts(false)} className={styles.back_button}> {"<"} Back</button>
            <h1 className={styles.view_workout_header}>View Your Workouts</h1>
            <h1 className={styles.select_message}>Select a workout to view</h1>
            <div className={styles.workout_selection_container}>
                {workouts.length === 0 ? (
                    <p className={styles.no_workout_message}>No workouts yet. Create one first!</p>
                ) : (
                    workouts.map((workout, index) => (
                        <div key={index}>
                            <button className={styles.workout_name_button} onClick={() => {setSelectedWorkout(workout);setShowModal(true)}}>
                                {workout.workout_name}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {showModal && selectedWorkout && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal_content}>
                        <button className={styles.back_button_second} onClick={() => {setSelectedWorkout(null);setShowModal(false)}}>
                            {"<"} Back
                        </button>
                        <h2 className={styles.modal_title}>{selectedWorkout.workout_name}</h2>
                        <h2 className={styles.exercises_header}>Exercises:</h2>
                        {selectedWorkout.exercises.map((exercise, index) => (
                            <div key={index} className={styles.exercise_container}>
                                <h3 className={styles.exercise_item}>{exercise}</h3>
                                <div className={styles.favorite_buttons_container}>
                                    <button 
                                        className={styles.add_favorite_button} 
                                        onClick={() => addToFavorites(exercise)}
                                        disabled={isFavorited(exercise)}
                                    >
                                        {isFavorited(exercise) ? 'Already Favorited' : 'Add To Favorites'}
                                    </button>
                                    <button 
                                        className={styles.remove_favorite_button} 
                                        onClick={() => removeFromFavorites(exercise)}
                                        disabled={!isFavorited(exercise)}
                                    >
                                        Remove From Favorites
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}  
            <Navbar/>
        </div>
    )
}