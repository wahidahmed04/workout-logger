import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav>
    <NavLink to="/home">Home     </NavLink>
    <NavLink to="/logger">Log a workout      </NavLink>
    <NavLink to="/history">View your workout history</NavLink>
    </nav>
  )
}
