import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaFilter, FaSortUp, FaSortDown } from "react-icons/fa";

const SearchBar = ({ onSearch, onSort, hasResults, totalItems }) => {
  const [filterBy, setFilterBy] = useState("title");
  const [query, setQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (value) => {
    setFilterBy(value);
    setShowFilterDropdown(false);
    onSearch(value, query);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(filterBy, value);
  };

  const handleSortClick = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    onSort(`${filterBy}-${newOrder}`);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch(filterBy, "");
  };

  return (
    <>
      <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="search-input-container" style={{ flex: 1, position: 'relative' }}>
          <FaSearch className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={`Search by ${filterBy}...`}
            value={query}
            onChange={handleSearchChange}
            className="search-input"
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
          {query && (
            <button onClick={clearSearch} className="clear-btn" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <FaTimes />
            </button>
          )}
        </div>
        <h3>                                       </h3>
        <h3>                                       </h3>
        <h3>                                       </h3>
          

        <div className="filter-container" ref={filterRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="filter-btn"
            style={{ 
              padding: '0.75rem',
              cursor: 'pointer',
              
            }}
          >
            <FaFilter />
          </button>
          {showFilterDropdown && (
            <div className="filter-dropdown" style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              marginTop: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '120px'
            }}>
              <div
                className={`filter-option ${filterBy === "title" ? "active" : ""}`}
                onClick={() => handleFilterChange("title")}
                style={{ padding: '0.75rem', cursor: 'pointer', background: filterBy === "title" ? '#e3f2fd' : 'white' }}
              >
                Title
              </div>
              <div
                className={`filter-option ${filterBy === "tags" ? "active" : ""}`}
                onClick={() => handleFilterChange("tags")}
                style={{ padding: '0.75rem', cursor: 'pointer', background: filterBy === "tags" ? '#e3f2fd' : 'white' }}
              >
                Tags
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSortClick} className="sort-btn" style={{ 
          padding: '0.75rem', 
          cursor: 'pointer',
          
        }}>
          {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
        </button>
      </div>

      {query && !hasResults && (
        <div className="no-results-message">
          <p>
            No results found for <strong>"{query}"</strong> in {filterBy}
          </p>
          <button onClick={clearSearch} className="clear-search-link">
            Clear search
          </button>
        </div>
      )}

      {query && hasResults && (
        <div className="results-count">
          Found {totalItems} result{totalItems !== 1 ? "s" : ""} for "{query}"
        </div>
      )}
    </>
  );
};

export default SearchBar;