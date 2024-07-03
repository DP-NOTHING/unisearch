import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./UniversitySearch.css";

const UniSearch = () => {
  const [country, setCountry] = useState("");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const cardRefs = useRef({});

  useEffect(() => {
    if (country) {
      searchUniversities();
    }
  }, [country]);

  const searchUniversities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://universities.hipolabs.com/search?country=${country}`
      );
      const data = await response.json();
      setUniversities(data);
      const allstate = data.map((uni) => uni["state-province"]);

      let uniquestate = [];

      for (let province of allstate) {
        if (province && !uniquestate.includes(province)) {
          uniquestate.push(province);
        }
      }

      uniquestate.unshift("All");

      setState(uniquestate);
      setSelectedState("All");
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUniversities = universities.filter(
    (uni) =>
      selectedState === "All" || uni["state-province"] === selectedState
  );

  const downloadCard = async (index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const canvas = await html2canvas(card);
    const dataURL = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
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
            onChange={(e) => setCountry(e.target.value)}
            className="search-input"
          />
          <button onClick={searchUniversities} className="search-button">
            <i className="fas fa-search">search</i>
          </button>
        </div>

        {/* {state.length > 0 && ( */}
        <div className="dropdown-container">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="province-dropdown"
          >
            {state.map((province) => (
              <option key={province} value={province}>
                {province || "State"}
              </option>
            ))}
          </select>
        </div>
        {/* )} */}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="university-grid">
          {filteredUniversities.map((uni, index) => (
            <div
              key={index}
              className="university-card"
              ref={(el) => (cardRefs.current[index] = el)}
            >
              <div className="card-content">
                <h3>{uni.name}</h3>
                <p>{uni["state-province"] || "N/A"}</p>
                <a
                  href={uni.web_pages[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="university-link"
                >
                  Visit Website
                </a>
              </div>
              <button
                className="download-button"
                onClick={() => downloadCard(index)}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniSearch;
