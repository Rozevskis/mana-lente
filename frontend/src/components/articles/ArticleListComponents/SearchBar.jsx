import React from 'react';

const SearchBar = ({ searchInput, setSearchInput, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        placeholder="Meklēt rakstus..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">Meklēt</button>
    </form>
  );
};

export default SearchBar;
