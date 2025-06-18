const cityInput = document.getElementById('cityInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherResult = document.getElementById('weatherResult');
const favoritesList = document.getElementById('favoritesList');
const apiKey = '7211cf8f0bf7f2336053869b10e0e22b'; // <-- Replace with your OpenWeatherMap API key

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function updateFavoritesUI() {
  favoritesList.innerHTML = '';
  favorites.forEach(city => {
    const li = document.createElement('li');

    // Create clickable city name span
    const span = document.createElement('span');
    span.textContent = city;
    span.style.cursor = 'pointer';
    span.onclick = () => {
      cityInput.value = city;
      getWeather(city);
    };

    // Create delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.marginLeft = '10px';
    delBtn.style.color = 'red';
    delBtn.style.border = 'none';
    delBtn.style.background = 'transparent';
    delBtn.style.cursor = 'pointer';
    delBtn.style.fontSize = '28px'; // slightly bigger for better visibility
    delBtn.style.fontWeight = 'bold'; // make bold
    delBtn.style.textTransform = 'uppercase'; // all caps, though × is a symbol
    delBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent triggering the city click event
      favorites = favorites.filter(fav => fav !== city);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      updateFavoritesUI();
    };

    li.appendChild(span);
    li.appendChild(delBtn);
    favoritesList.appendChild(li);
  });
}

function getWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("City not found");
      return response.json();
    })
    .then(data => {
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      const windDirection = getWindDirection(data.wind.deg);

      const weatherHTML = `
        <h2>${data.name}</h2>
        <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
        <p>🌡️ ${data.main.temp} °F (feels like ${data.main.feels_like} °F)</p>
        <p>🔻 Min: ${data.main.temp_min} °F | 🔺 Max: ${data.main.temp_max} °F</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌬️ Wind: ${data.wind.speed} mph ${windDirection}</p>
        <p>🌅 Sunrise: ${sunrise} | 🌇 Sunset: ${sunset}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon"><br>
        <button id="favoriteBtn">⭐ Save to Favorites</button>
      `;
      weatherResult.innerHTML = weatherHTML;

      document.getElementById('favoriteBtn').onclick = () => saveFavorite(data.name);
    })
    .catch(error => {
      weatherResult.innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function saveFavorite(city) {
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesUI();
  }
}

getWeatherBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name.');
    return;
  }
  getWeather(city);
});

// Load favorites on startup
updateFavoritesUI();