import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (location: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    if (location.trim()) {
      onSearch(location);
    } else {
      alert("Please enter a valid location.");
    }
  };
  

  return (
    <div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
