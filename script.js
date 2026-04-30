const apiKey = "489e7c532f3dfa58ea432db5b594eab3";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const errorMsg = document.getElementById('error-msg');

// Elements to update
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temp');
const iconEl = document.getElementById('weather-icon');
const descEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if (response.status === 404) {
      errorMsg.classList.remove('hidden');
      weatherInfo.classList.add('hidden');
      return;
    }

    const data = await response.json();

    // Update UI
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    descEl.textContent = data.weather.description;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${data.wind.speed} km/h`;
    
    // Set icon
    const iconCode = data.weather.icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Show weather info, hide error
    weatherInfo.classList.remove('hidden');
    errorMsg.classList.add('hidden');

  } catch (error) {
    console.error("Error fetching weather data:", error);
    errorMsg.textContent = "⚠️ Network error. Please check your connection.";
    errorMsg.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
  }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    checkWeather(city);
  }
});

// Allow "Enter" key to search
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) {
      checkWeather(city);
    }
  }
});