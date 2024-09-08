import React, { useState, useEffect, useCallback, memo } from 'react';
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

const GuessInput = memo(({ onGuess }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(() => {
    onGuess(inputValue);
    setInputValue('');
  }, [inputValue, onGuess]);

  return (
    <div className="guess-container">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter country name"
        className="game-input"
      />
      <button className="game-button full-width" onClick={handleSubmit}>Submit Guess</button>
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
  const [lives, setLives] = useState(3);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState('');
  const [menuLocation, setMenuLocation] = useState(null);

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

  const loadLeaderboard = () => {
    const storedLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setLeaderboard(storedLeaderboard);
  };

  const saveScore = (newScore, playerName) => {
    const updatedLeaderboard = [...leaderboard, { name: playerName, date: new Date().toLocaleString() }]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // Keep only top 10 recent entries

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
  };

  const handleGuess = useCallback((guess) => {
    if (guess.toLowerCase() === location.country.toLowerCase()) {
      setResult('Correct!');
      setScore(prevScore => prevScore + 1);
    } else {
      setResult(`Wrong! The correct answer was ${location.country}.`);
      setLives(prevLives => prevLives - 1);
      if (lives === 1) {
        // Game over
        setView('gameOver');
        return;
      }
    }
    setLocation(getRandomLocation());
  }, [location, lives, score]);

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
    setLives(3);
    setLocation(getRandomLocation());
    setMenuLocation(null); // Reset menu location
    setView('game');
  };

  const goToMenu = () => {
    setView('menu');
  };

  const renderMenu = () => {
    if (!menuLocation) {
      return <div>Loading...</div>;
    }

    const randomBearing = Math.floor(Math.random() * 360);

    return (
      <div className="fullscreen game-background">
        <div className="menu-street-view">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed?pb=!4v1616426339741!6m8!1m7!1sCAoSLEFGMVFpcE5QTzNJNVlkNHRsRDJoTFdjX3ZGQkJhbkNMLXpEYTNGS0xKVFE3!2m2!1d${menuLocation.lat}!2d${menuLocation.lng}!3f${randomBearing}!4f0!5f0.8160813932612223&disableDefaultUI=1&scrollwheel=0&draggable=0`}
            allowFullScreen
          ></iframe>
        </div>
        <h1 className="game-title">
          <span className="world-icon">🌍</span> Guess the Country
        </h1>
        <div className="content-container menu-container">
          <div className="button-container">
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
            <span className="lives">{Array(lives).fill('💛').join(' ')}</span>
          </div>
          <h2 className="section-title"><span className="world-icon">🌍</span>Guess the Country</h2>
          <GuessInput onGuess={handleGuess} />
          {result && <p className="result">{result}</p>}
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.name}</td>
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
        <p className="game-text">Guess the Country is a game where you guess the country based on a Google Street View image.</p>
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
