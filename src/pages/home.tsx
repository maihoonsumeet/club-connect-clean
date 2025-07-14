import React, { useState } from 'react';
import ClubCard from '../components/ClubCard';
import clubs from '../data/clubs.json';

export default function Home() {
  const [search, setSearch] = useState('');

  const filtered = clubs.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search clubs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.map(club => (
        <ClubCard key={club.id} id={club.id} name={club.name} description={club.description} />
      ))}
    </div>
  );
}
