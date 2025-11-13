import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';

function SearchBar() {
  const { searchQuery, handleSearch } = useContext(AppContext);
  const [localQuery, setLocalQuery] = useState('');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce search for 300ms
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleClear = () => {
    setLocalQuery('');
    handleSearch('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search notes..."
        value={localQuery}
        onChange={handleInputChange}
        className="search-input"
      />
      {localQuery && (
        <button className="search-clear" onClick={handleClear}>
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;
