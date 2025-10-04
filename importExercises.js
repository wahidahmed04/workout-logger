// importAllExercisesCapitalized.js
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const API_URL = 'https://exercisedb.p.rapidapi.com/exercises';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Helper function to capitalize each word
function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function fetchExercisesPage(offset = 0, limit = 50) {
  const res = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch exercises: ${res.statusText}`);

  const data = await res.json();
  return data;
}

async function fetchAllExercises() {
  let allExercises = [];
  let offset = 0;
  const limit = 50;
  while (true) {
    const page = await fetchExercisesPage(offset, limit);
    if (page.length === 0) break;
    allExercises = allExercises.concat(page);
    offset += limit;
  }
  console.log(`Fetched total of ${allExercises.length} exercises from API.`);
  return allExercises;
}

async function insertExercises(exercises) {
  for (const exercise of exercises) {
    const capitalizedName = capitalizeWords(exercise.name);
    const { error } = await supabase
      .from('exercise_catalog')
      .insert({ name: capitalizedName });
    if (error) console.error(`Error inserting ${capitalizedName}:`, error);
  }
  console.log('All exercises inserted!');
}

async function main() {
  try {
    // Optional: delete all existing rows first
    await supabase.from('exercise_catalog').delete().neq('id', 0);

    const exercises = await fetchAllExercises();
    await insertExercises(exercises);
  } catch (err) {
    console.error(err);
  }
}

main();
