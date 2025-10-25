import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from '/src/styling/Navbar.module.css'

export default function Navbar() {
  return (
    <nav>
    <div className={styles.navlink_container}>
    <NavLink to="/home" className={styles.link}>Home     </NavLink>
    <NavLink to="/logger" className={styles.link}>Log a workout      </NavLink>
    <NavLink to="/history" className={styles.link}>Workout history</NavLink>
    </div>
    </nav>
  )
}
