import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './UniversitySearch.css';

const UniSearch = () => {
  const [country, setCountry] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const cardRefs = useRef({});

  const searchUniversities = async () => {
    if (!country.trim()) return;
    
    setLoading(true);
    setSearchPerformed(true);
    setUniversities([]);
    setProvinces(['All']);

    try {
      const response = await fetch(`http://universities.hipolabs.com/search?country=${country}`);
      const data = await response.json();
      
      setUniversities(data);
      
      const uniqueProvinces = [...new Set(data.map(uni => uni['state-province']).filter(Boolean))];
      setProvinces(['All', ...uniqueProvinces]);
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchUniversities();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchUniversities();
    }
  };

  const filteredUniversities = universities.filter(uni => 
    selectedProvince === 'All' || uni['state-province'] === selectedProvince
  );

  const downloadCard = async (index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const canvas = await html2canvas(card);
    const dataURL = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `university_card_${index}.jpg`;
    link.click();
  };

  return (
    <div className="university-search">
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search your desired Country"
            value={country}
            onChange={(e) =>{setCountry(e.target.value);}}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <i className="fas fa-search">search</i>
          </button>
        </div>
        
        {provinces.length > 1 && (
          <div className="dropdown-container">
            <select 
              value={selectedProvince} 
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="province-dropdown"
            >
              {provinces.map(province => (
                <option key={province} value={province}>{province || 'State'}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {loading && <div className="loading">Loading...</div>}
      
      {!loading && searchPerformed && universities.length === 0 && (
        <div className="no-results">No universities found for the given country.</div>
      )}
      
      {!loading && universities.length > 0 && (
        <div className="university-grid">
          {filteredUniversities.map((uni, index) => (
            <div key={index} className="university-card" ref={el => cardRefs.current[index] = el}>
              <div className="card-content">
                <h3>{uni.name}</h3>
                <p>{uni['state-province'] || 'N/A'}</p>
                <a href={uni.web_pages[0]} target="_blank" rel="noopener noreferrer" className="university-link">
                  Visit Website
                </a>
              </div>
              <button className="download-button" onClick={() => downloadCard(index)}>Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniSearch;