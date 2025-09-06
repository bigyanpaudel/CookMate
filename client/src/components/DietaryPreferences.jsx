import React, { useState, useEffect } from 'react';

const DietaryPreferences = () => {
  const [preferences, setPreferences] = useState({
    dietary: [],
    allergies: [],
    cuisine: [],
    healthGoals: []
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const options = {
    dietary: [
      'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 
      'Low-Carb', 'Keto', 'Paleo', 'Mediterranean', 'Low-Sodium'
    ],
    allergies: [
      'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Soy', 'Wheat', 'Dairy'
    ],
    cuisine: [
      'Italian', 'Asian', 'Mexican', 'Indian', 'Mediterranean', 'American', 
      'Thai', 'Chinese', 'Japanese', 'Middle Eastern'
    ],
    healthGoals: [
      'Weight Loss', 'Muscle Gain', 'Heart Health', 'Diabetes Management',
      'High Protein', 'Low Calorie', 'Anti-Inflammatory', 'Energy Boost'
    ]
  };

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('userDietaryPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (category, item) => {
    setPreferences(prev => {
      const newPrefs = {
        ...prev,
        [category]: prev[category].includes(item)
          ? prev[category].filter(i => i !== item)
          : [...prev[category], item]
      };
      
      // Save to localStorage
      localStorage.setItem('userDietaryPreferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  const searchWithPreferences = () => {
    // Build search query including dietary preferences
    const allPrefs = [
      ...preferences.dietary,
      ...preferences.allergies.map(allergy => `no ${allergy.toLowerCase()}`),
      ...preferences.cuisine,
      ...preferences.healthGoals
    ];
    
    if (allPrefs.length > 0) {
      const query = allPrefs.join(' ');
      window.location.href = `/search?q=${encodeURIComponent(query)}&preferences=true`;
    }
  };

  const getTotalSelected = () => {
    return Object.values(preferences).reduce((total, arr) => total + arr.length, 0);
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Dietary Preferences & Health Goals</h5>
            <div className="d-flex align-items-center gap-3">
              {getTotalSelected() > 0 && (
                <span className="badge bg-light text-success">
                  {getTotalSelected()} selected
                </span>
              )}
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Customize'}
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="card-body">
            {/* Dietary Restrictions */}
            <div className="mb-4">
              <h6 className="text-success mb-3">Dietary Restrictions</h6>
              <div className="d-flex flex-wrap gap-2">
                {options.dietary.map(item => (
                  <span
                    key={item}
                    className={`badge p-2 ${preferences.dietary.includes(item) 
                      ? 'bg-success text-white' 
                      : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => handleToggle('dietary', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="mb-4">
              <h6 className="text-danger mb-3">Allergies & Intolerances</h6>
              <div className="d-flex flex-wrap gap-2">
                {options.allergies.map(item => (
                  <span
                    key={item}
                    className={`badge p-2 ${preferences.allergies.includes(item) 
                      ? 'bg-danger text-white' 
                      : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => handleToggle('allergies', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">Favorite Cuisines</h6>
              <div className="d-flex flex-wrap gap-2">
                {options.cuisine.map(item => (
                  <span
                    key={item}
                    className={`badge p-2 ${preferences.cuisine.includes(item) 
                      ? 'bg-primary text-white' 
                      : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => handleToggle('cuisine', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Health Goals */}
            <div className="mb-4">
              <h6 className="text-info mb-3">Health Goals</h6>
              <div className="d-flex flex-wrap gap-2">
                {options.healthGoals.map(item => (
                  <span
                    key={item}
                    className={`badge p-2 ${preferences.healthGoals.includes(item) 
                      ? 'bg-info text-white' 
                      : 'bg-light text-dark'}`}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={() => handleToggle('healthGoals', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <button 
                className="btn btn-success me-3"
                onClick={searchWithPreferences}
                disabled={getTotalSelected() === 0}
              >
                Find Recipes Based on Preferences
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setPreferences({ dietary: [], allergies: [], cuisine: [], healthGoals: [] });
                  localStorage.removeItem('userDietaryPreferences');
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        
        {/* Quick Summary when collapsed */}
        {!isExpanded && getTotalSelected() > 0 && (
          <div className="card-body py-2">
            <div className="d-flex flex-wrap gap-1">
              {[...preferences.dietary, ...preferences.allergies, ...preferences.cuisine, ...preferences.healthGoals]
                .slice(0, 5).map((pref, index) => (
                <span key={index} className="badge bg-light text-dark small">
                  {pref}
                </span>
              ))}
              {getTotalSelected() > 5 && (
                <span className="badge bg-light text-muted small">
                  +{getTotalSelected() - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryPreferences;