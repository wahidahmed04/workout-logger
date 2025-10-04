import { Link } from "react-router-dom"
export default function WorkoutLogger({session}) {
  return (
    <>
    <h1>Workout Logger</h1>
    <Link to="/">Go back</Link>
    <button>Workouts</button>
    <button>Log a workout</button>
    </>
  )
}
