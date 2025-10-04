import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {createHashRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import WorkoutHistory from './components/WorkoutHistory.jsx';
import WorkoutLogger from './components/WorkoutLogger.jsx';
import Home from './components/Home.jsx';

const router = createHashRouter([
  {path: "/", element: <App />},
  {path: "/logger", element: <WorkoutLogger/>},
  {path :"/history", element: <WorkoutHistory/>},
  {path: "/home", element: <Home/>},
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router} />
  </StrictMode>
);
