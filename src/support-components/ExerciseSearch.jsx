// ExerciseSearch.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ExerciseSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    async function searchExercises() {
      const { data, error } = await supabase
        .from('exercise_catalog')
        .select('id, name')
        .ilike('name', `%${query}%`); // case-insensitive partial match

      if (error) console.error(error);
      else setResults(data);
    }

    searchExercises();
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search exercises..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '300px', padding: '5px' }}
      />
      <ul>
        {results.map((exercise) => (
          <li key={exercise.id}>{exercise.name}</li>
        ))}
      </ul>
    </div>
  );
}
