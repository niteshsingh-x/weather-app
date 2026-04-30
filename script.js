const apiKey = "489e7c532f3dfa58ea432db5b594eab3";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const pinBtn = document.getElementById('pin-btn');
const closePinnedBtn = document.getElementById('close-pinned');
const weatherInfo = document.getElementById('weather-info');
const errorMsg = document.getElementById('error-msg');
const savedLocationsDiv = document.getElementById('saved-locations');
const pinnedList = document.getElementById('pinned-list');

// Elements to update
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temp');
const iconEl = document.getElementById('weather-icon');
const descEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

// State
let currentCity = null;
let pinnedLocations = JSON.parse(localStorage.getItem('pinnedLocations')) || [];

// Initialize
function init() {
  renderPinnedLocations();
  
  // Close button logic
  if (closePinnedBtn) {
    closePinnedBtn.addEventListener('click', () => {
      savedLocationsDiv.classList.add('hidden');
    });
  }
  
  // Try to auto-detect location on load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.log("Geolocation denied or error:", error);
      }
    );
  }
}

// Fetch weather by City Name
async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if (response.status === 404) {
      errorMsg.classList.remove('hidden');
      weatherInfo.classList.add('hidden');
      return;
    }

    const data = await response.json();
    currentCity = data.name; 

    updateUI(data);
    updatePinButton(currentCity);
    
    if (pinnedLocations.length > 0) {
      savedLocationsDiv.classList.remove('hidden');
    }

  } catch (error) {
    console.error("Error fetching weather data:", error);
    errorMsg.textContent = "⚠️ Network error. Please check your connection.";
    errorMsg.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
  }
}

// Fetch weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    currentCity = data.name;
    updateUI(data);
    updatePinButton(currentCity);
  } catch (error) {
    console.error("Geolocation fetch error:", error);
  }
}

// Update UI Elements
function updateUI(data) {
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  descEl.textContent = data.weather.description;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} km/h`;
  
  const iconCode = data.weather.icon;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherInfo.classList.remove('hidden');
  errorMsg.classList.add('hidden');
}

// Toggle Pin Button State
function updatePinButton(city) {
  if (pinnedLocations.includes(city)) {
    pinBtn.textContent = "📌";
    pinBtn.classList.add('active');
  } else {
    pinBtn.textContent = "🔓";
    pinBtn.classList.remove('active');
  }
}

// Pin/Unpin City
pinBtn.addEventListener('click', () => {
  if (!currentCity) return;

  if (pinnedLocations.includes(currentCity)) {
    // Unpin
    pinnedLocations = pinnedLocations.filter(c => c !== currentCity);
    pinBtn.textContent = "🔓";
    pinBtn.classList.remove('active');
  } else {
    // Pin
    pinnedLocations.push(currentCity);
    pinBtn.textContent = "📌";
    pinBtn.classList.add('active');
  }

  localStorage.setItem('pinnedLocations', JSON.stringify(pinnedLocations));
  renderPinnedLocations();
});

// Render Pinned Locations List
function renderPinnedLocations() {
  pinnedList.innerHTML = '';
  
  if (pinnedLocations.length === 0) {
    savedLocationsDiv.classList.add('hidden');
    return;
  }

  savedLocationsDiv.classList.remove('hidden');
  
  pinnedLocations.forEach(city => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${city}</span>
      <div>
        <button onclick="loadPinnedCity('${city}')">Load</button>
        <button onclick="removePinnedCity('${city}')">❌</button>
      </div>
    `;
    pinnedList.appendChild(li);
  });
}

// Load a pinned city (Global function for onclick in HTML)
window.loadPinnedCity = function(city) {
  cityInput.value = city;
  checkWeather(city);
  // Optional: Close the panel after loading
  // savedLocationsDiv.classList.add('hidden'); 
};

// Remove a pinned city (Global function for onclick in HTML)
window.removePinnedCity = function(city) {
  pinnedLocations = pinnedLocations.filter(c => c !== city);
  localStorage.setItem('pinnedLocations', JSON.stringify(pinnedLocations));
  renderPinnedLocations();
  
  // If we removed the currently viewed city, update button state
  if (currentCity === city) {
    updatePinButton(currentCity);
  }
};

// Event Listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) checkWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) checkWeather(city);
  }
});

geoBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        errorMsg.textContent = "🚫 Location access denied or error.";
        errorMsg.classList.remove('hidden');
        weatherInfo.classList.add('hidden');
      }
    );
  } else {
    errorMsg.textContent = "🚫 Geolocation not supported by this browser.";
    errorMsg.classList.remove('hidden');
  }
});

// Initialize on load
init();