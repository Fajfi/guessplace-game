import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import './App.css';
import { CSSTransition } from 'react-transition-group';

const locations = [
  { lat: 48.8584, lng: 2.2945, country: 'France' },
  { lat: 40.7128, lng: -74.0060, country: 'USA' },
  { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { lat: 51.5074, lng: -0.1278, country: 'UK' },
  { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { lat: 55.7558, lng: 37.6173, country: 'Russia' },
  { lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { lat: 52.2297, lng: 21.0122, country: 'Poland' },
  { lat: 40.4168, lng: -3.7038, country: 'Spain' },
  { lat: 31.2304, lng: 121.4737, country: 'China' },
  { lat: 28.6139, lng: 77.2090, country: 'India' },
  { lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  { lat: 59.3293, lng: 18.0686, country: 'Sweden' },
  { lat: 55.6761, lng: 12.5683, country: 'Denmark' },
  { lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
  { lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  { lat: 30.0444, lng: 31.2357, country: 'Egypt' },
];

const getRandomLocation = () => {
  const randomIndex = Math.floor(Math.random() * locations.length);
  const baseLocation = locations[randomIndex];
  
  // Add small random offsets to lat and lng (about ±5km)
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;
  
  return {
    ...baseLocation,
    lat: baseLocation.lat + latOffset,
    lng: baseLocation.lng + lngOffset
  };
};

const GuessInput = memo(({ onGuess, correctCountry, otherCountries }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer !== null) {
      onGuess(selectedAnswer);
      setSelectedAnswer(null);
    }
  }, [selectedAnswer, onGuess]);

  // Shuffle all answers together
  const shuffledAnswers = useMemo(() => {
    const allAnswers = [correctCountry, ...otherCountries];
    return allAnswers.sort(() => Math.random() - 0.5);
  }, [correctCountry, otherCountries]);

  const answers = [
    { label: 'a)', country: shuffledAnswers[0] },
    { label: 'b)', country: shuffledAnswers[1] },
    { label: 'c)', country: shuffledAnswers[2] },
    { label: 'd)', country: shuffledAnswers[3] }
  ];

  return (
    <div className="guess-container">
      <div className="answer-options">
        {answers.map((answer, index) => (
          <button
            key={index}
            className={`answer-button ${selectedAnswer === answer.country ? 'selected' : ''}`}
            onClick={() => setSelectedAnswer(answer.country)}
          >
            <span className="answer-label">{answer.label}</span> {answer.country}
          </button>
        ))}
      </div>
      <button className="game-button full-width" onClick={handleSubmit} disabled={selectedAnswer === null}>
        Submit Guess
      </button>
    </div>
  );
});

const StreetView = memo(({ location }) => {
  const randomBearing = Math.floor(Math.random() * 360);
  return (
    <div className="street-view-container">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.google.com/maps/embed?pb=!4v1616426339741!6m8!1m7!1sCAoSLEFGMVFpcE5QTzNJNVlkNHRsRDJoTFdjX3ZGQkJhbkNMLXpEYTNGS0xKVFE3!2m2!1d${location.lat}!2d${location.lng}!3f${randomBearing}!4f0!5f0.8160813932612223&disableDefaultUI=1&scrollwheel=0&draggable=0`}
        allowFullScreen
      ></iframe>
    </div>
  );
});

function App() {
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState('');
  const [view, setView] = useState('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isGameActive, setIsGameActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState('');
  const [menuLocation, setMenuLocation] = useState(null);
  const [otherCountries, setOtherCountries] = useState([]);
  const [summaryLink, setSummaryLink] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedTime, setSelectedTime] = useState(300); // Default 5 minutes

  useEffect(() => {
    setLocation(getRandomLocation());
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (!menuLocation) {
      const newMenuLocation = getRandomLocation();
      setMenuLocation(newMenuLocation);
    }
  }, [menuLocation]);

  useEffect(() => {
    if (location) {
      const availableCountries = locations.map(loc => loc.country).filter(country => country !== location.country);
      const shuffled = availableCountries.sort(() => 0.5 - Math.random());
      const selectedOtherCountries = shuffled.slice(0, 3);
      const allOptions = [location.country, ...selectedOtherCountries];
      const shuffledOptions = allOptions.sort(() => 0.5 - Math.random());
      setOtherCountries(shuffledOptions.filter(country => country !== location.country));
    }
  }, [location]);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setView('gameOver');
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const loadLeaderboard = () => {
    const storedLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setLeaderboard(storedLeaderboard);
  };

  const saveScore = (newScore, playerName) => {
    const updatedLeaderboard = [...leaderboard, { name: playerName, score: newScore, date: new Date().toLocaleString() }]
      .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Keep only top 10 entries

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleGuess = useCallback((guess) => {
    const isCorrect = guess === location.country;
    const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`;
    
    if (isCorrect) {
      setResult('Correct!');
      setScore(prevScore => prevScore + 1);
    } else {
      setResult(`Wrong! The correct answer was ${location.country}.`);
    }
    
    setSummaryLink(streetViewLink);
    setShowSummary(true);
  }, [location]);

  const handleNextLocation = () => {
    setResult('');
    setSummaryLink('');
    setShowSummary(false);
    setLocation(getRandomLocation());
  };

  const handleSaveScore = () => {
    if (username.trim() && score > 0) {
      saveScore(score, username);
      setUsername('');
      setView('leaderboard');
    } else if (score === 0) {
      setView('menu'); // Go back to menu if score is 0
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(selectedTime); // Use the selected time
    setLocation(getRandomLocation());
    setMenuLocation(null);
    setView('game');
    setIsGameActive(true);
  };

  const goToMenu = () => {
    setView('menu');
  };

  const handleTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSelectedTime(value * 60); // Convert minutes to seconds
    }
  };

  const renderMenu = () => {
    if (!menuLocation) {
      return <div>Loading...</div>;
    }

    const randomBearing = Math.floor(Math.random() * 360);

    return (
      <div className="fullscreen game-background">
        <h1 className="game-title">
          <span className="world-icon">🌍</span> Guess the Country
        </h1>
        <div className="content-container menu-container">
          <div className="button-container">
            <div className="timer-selection">
              <label htmlFor="game-timer">Game Duration (minutes):</label>
              <input
                id="game-timer"
                type="number"
                min="1"
                value={selectedTime / 60}
                onChange={handleTimeChange}
                className="game-input timer-input"
              />
            </div>
            <button onClick={startGame} className="game-button pulse">New Game</button>
            <button onClick={() => setView('leaderboard')} className="game-button">Leaderboard</button>
            <button onClick={() => setView('about')} className="game-button">About</button>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => (
    <div className="fullscreen game-background">
      <StreetView location={location} />
      <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
        <div className="game-ui floating">
          <div className="game-stats">
            <span>Score: {score}</span>
            <span className="timer">{formatTime(timeLeft)}</span>
          </div>
          {!showSummary ? (
            <GuessInput onGuess={handleGuess} correctCountry={location.country} otherCountries={otherCountries} />
          ) : (
            <div className="result-summary">
              <p className="result">{result}</p>
              <div className="summary-buttons">
                <button className="game-button" onClick={handleNextLocation}>Next Location</button>
                {summaryLink && (
                  <a href={summaryLink} target="_blank" rel="noopener noreferrer" className="game-button street-view-button">
                    Street View
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </CSSTransition>
    </div>
  );

  const renderGameOver = () => (
    <div className="fullscreen game-background">
      <div className="content-container">
        <h2 className="section-title">Game Over</h2>
        <p className="game-text">Your final score: {score}</p>
        {score > 0 ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="game-input"
            />
            <button className="game-button" onClick={handleSaveScore} disabled={!username.trim()}>
              Save Score
            </button>
          </>
        ) : (
          <p className="game-text">Score too low to save.</p>
        )}
        <button className="game-button" onClick={() => setView('menu')}>Back to Menu</button>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="fullscreen game-background">
      <div className="leaderboard-container">
        <h2 className="section-title">Leaderboard</h2>
        <div className="leaderboard-scroll">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.name}</td>
                  <td>{entry.score}</td>
                  <td>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="game-button" onClick={goToMenu}>Back to Menu</button>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="fullscreen game-background">
      <div className="content-container">
        <h2 className="section-title">About</h2>
        <p className="game-text">Guess the Country is a game where you guess the country based on a Google Street View image. Test your geography knowledge and explore the world!</p>
        <button className="game-button" onClick={goToMenu}>Back to Menu</button>
      </div>
    </div>
  );

  return (
    <div className={`App ${view === 'game' ? 'fullscreen' : ''}`}>
      {view === 'menu' && renderMenu()}
      {view === 'game' && location && renderGame()}
      {view === 'gameOver' && renderGameOver()}
      {view === 'leaderboard' && renderLeaderboard()}
      {view === 'about' && renderAbout()}
    </div>
  );
}

export default App;
