import { Link } from "react-router-dom"
import Navbar from "./Navbar"
export default function WorkoutLogger({session}) {
  return (
    <>
    <h1>Workout Logger</h1>
    <button>Workouts</button>
    <button>Log a workout</button>
    <Navbar/>
    </>
  )
}
