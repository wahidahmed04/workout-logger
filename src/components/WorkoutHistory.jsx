import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../support-components/Navbar'
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from '/src/styling/WorkoutHistory.module.css'

export default function WorkoutHistory({userSigningIn, setUserSigningIn}) {
    const [session, setSession] = useState(null);
    const [workouts, setWorkouts] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedWorkout, setSelectedWorkout] = useState("")
    const [selectedWorkoutDate, setSelectedWorkoutDate] = useState("")
    const [exercises, setExercises] = useState([])
    const [exerciseIds, setExerciseIds] = useState({})
    const [sets, setSets] = useState({})
    const [username, setUsername] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const WORKOUTS_PER_PAGE = 10;

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

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) console.error(error.message)
        else setUserSigningIn(true)
    }
  
    const getUserExercises = async (workoutId) => {
        const {data: exerciseDate, error: dateError} = await supabase
          .from("workouts")
          .select("created_at")
          .eq("id", workoutId)
          .single();
        if(dateError) console.error(dateError)
        else setSelectedWorkoutDate(datify(exerciseDate.created_at))
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
      setSets(sets);
    }

    useEffect(() => {
      const getSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error(error);
        else setSession(session);
      };
      getSession();
    }, []);

    useEffect(() => {
      if (session?.user?.id) {
        const getUser = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, created_at')
            .eq('id', session.user.id)
            .single()

          if (error) console.error('Error fetching profile:', error)
          else {
            setUsername(data.username)
          }
          getUserWorkouts();
        }
        getUser()
      }
    }, [session]);

    const navigate = useNavigate()

    useEffect(() => {
      if (userSigningIn) {
        navigate('/')
      }
    }, [userSigningIn, navigate])

    const datify = (dateString) => {
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return formatted
    }

    // Pagination calculations
    const totalPages = Math.ceil(workouts.length / WORKOUTS_PER_PAGE);
    const startIndex = currentPage * WORKOUTS_PER_PAGE;
    const endIndex = startIndex + WORKOUTS_PER_PAGE;
    const currentWorkouts = workouts.slice(startIndex, endIndex);

    const goToNextPage = () => {
      if (currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      }
    };

    const goToPreviousPage = () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div className={styles.all_container}>
        <div className={styles.dash_container}>
          <h1 className={styles.title}>Workout Logger</h1>
          <h1 className={styles.username}>@{username}</h1>
          <button onClick={signOut} className={styles.log_out_button}>Log out</button>
        </div>
        <h1 className={styles.header}>Workout History</h1>
        <h2 className={styles.select}>Select a workout to view</h2>
        
        {/* Pagination Controls */}
        {workouts.length > 0 && (
          <div className={styles.pagination_controls}>
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 0}
              className={styles.pagination_button}
            >
              Previous
            </button>
            <span className={styles.page_info}>
              Page {currentPage + 1} of {totalPages} ({workouts.length} total workouts)
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages - 1}
              className={styles.pagination_button}
            >
              Next
            </button>
          </div>
        )}

        <div className={styles.workout_containers}>
          {currentWorkouts.map((workout, index) => (
            <div key={index}>
              <button 
                className={styles.workout_header} 
                onClick={() => {
                  getUserExercises(workout.id);
                  setSelectedWorkout(workout);
                  setShowModal(true);
                }}
              >
                {workout.name} --- {datify(workout.created_at)}
              </button>
              <br/>
            </div>
          ))}
        </div>

        {showModal && (
          <div className={styles.modal_overlay}>
            <div className={styles.modal_content}>
              <h1 className={styles.date}>{selectedWorkoutDate}</h1>
              <h1 className={styles.workout_name}>{selectedWorkout.name}</h1>
              {exercises.map((exercise, index) => {
                const name = exercise.name
                const tempList = sets[name]
                return (
                  <div className={styles.exercise_container} key={index}>
                  <div>
                    <h3 className={styles.exercise_name}>{name}</h3>
                    <span className={styles.set_header}>Set</span>
                    <span className={styles.rep_header}>Reps</span>
                    <span className={styles.weight_header}>Weight</span>
                    {Array.isArray(tempList) && tempList.map((obj, index) => (
                      <div key={index}>
                        <span className={styles.set_num}>{obj.setNumber}</span>
                        <div className={styles.rep_weight_container}>
                          <span className={styles.reps}>{obj.reps}</span>
                          <span className={styles.separator}>|</span>
                          <span className={styles.weight}>{obj.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                )
              })}
              <button onClick={() => {
                setExercises([]); 
                setSets({})
                setSelectedWorkout(""); 
                setShowModal(false);
              }}>
                Go back
              </button>
            </div>
          </div>
        )}
        <Navbar/>
      </div>
    )
}