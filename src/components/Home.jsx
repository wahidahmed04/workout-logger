import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {useState, useEffect} from 'react'
import Navbar from '../support-components/Navbar'
import styles from '/src/styling/Home.module.css'

export default function Home({session, userSigningIn, setUserSigningIn}) {
  const [username, setUsername] = useState('')
  const [accountAge, setAccountAge] = useState(null)
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [favoriteExercises, setFavoriteExercises] = useState([])
  const [totalSets, setTotalSets] = useState(0)
  const [height, setHeight] = useState(70);
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
      const createdAt = new Date(data.created_at);
    const now = new Date();
    const diffMs = now - createdAt; // difference in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convert ms to days

    setAccountAge(diffDays);
    }
  }

  fetchProfile()
}, [session])
useEffect(() => {
  if (!session?.user) return
  async function getNumOfWorkouts() {
  const {data, error} = await supabase
  .from("workouts")
  .select("*")
  .eq("user_id", session.user.id)
  if(error) return error
  else return data.length
  }
  setTotalWorkouts(getNumOfWorkouts())
}, [session])
useEffect(() => {
  if (!session?.user) return
  async function getNumOfSets() {
  const { data, error } = await supabase
  .rpc('get_user_set_count', { uid: session.user.id });
  if (error) return error;
  else return data; // data is the count

  }
  setTotalSets(getNumOfSets())
}, [session])
useEffect(() => {
  if (!session?.user) return;

  async function getFavoriteExercises() {
    const { data, error } = await supabase
      .from("favorite_exercises")
      .select("name")  // make sure this matches your column name
      .eq("user_id", session.user.id);

    if (error) console.error('Error fetching favorites:', error);
    else {
      setFavoriteExercises(data); // set the actual array, not a promise
      setHeight(70+data.length*30);
      if(data.length===0){
        setHeight(100)
      }
    }
  }

  getFavoriteExercises(); // call the async function
}, [session]);

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
  return (
    <div className={styles.container}>
    <div className={styles.dash_container}>
    <h1 className={styles.title}>Workout Logger</h1>
    <h1 className={styles.username}>@{username}</h1>
    <button onClick={signOut} className={styles.log_out_button}>Log out</button>
    </div>
    <h1 className={styles.stats_header}>Performance Overview</h1>
    
    <div className={styles.stats_container_favorites} style={{ '--dynamic-height': `${height}px` }}>
    {Array.isArray(favoriteExercises) && favoriteExercises.map((exercise, index) => (
      <h1 key={index} className={styles.stats_favorites}>{exercise.name}   </h1>
    ))}
    {favoriteExercises.length === 0 ? <h1 className={styles.stats_favorites}>No favorite exercises yet</h1> : ""}
    <h1 className={styles.stats_favorites_label}>Favorite exercises</h1>
    </div>
    <div className={styles.flex_container}>
    <div className={styles.stats_container_default}>
    <h1 className={styles.stats_default}>{accountAge} {accountAge === 1 ? "day" : "days"}</h1>
    <h3 className={styles.stats_default_label}>Account age</h3>
    </div>
    <div className={styles.stats_container_default}>
    <h1 className={styles.stats_default}>{totalWorkouts}</h1>
    <h3 className={styles.stats_default_label}>Workouts</h3>
    </div>
    <div className={styles.stats_container_default}>
    <h1 className={styles.stats_default}>{totalSets}</h1>
    <h3 className={styles.stats_default_label}>Sets</h3>
    </div>
    </div>
    <Navbar/>
    </div>
  )
}
