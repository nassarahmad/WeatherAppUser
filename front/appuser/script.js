// DOM Elements
const cityInput = document.getElementById("city_input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addFavoriteBtn = document.getElementById("addFavoriteBtn");
const favoritesList = document.querySelector(".favorites-list");
const loadingIndicator = document.getElementById("loadingIndicator");

// App State
let currentCity = null;
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadDefaultLocation();
});

// Authentication Check
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            displayFavorites();
        } else {
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '../index.html';
    }
}

async function searchCity() {
  const cityName = cityInput.value.trim();
  if (!cityName) {
      Swal.fire({
            icon: 'warning',
            title: 'Empty City',
            text: 'Please enter a city name',
            confirmButtonText: 'OK'
      });
      return;
  }

  try {
      loadingIndicator.style.display = 'flex';
      
      
      const geoResponse = await fetch(`/api/geocode/${encodeURIComponent(cityName)}`);
      if (!geoResponse.ok) {
          throw new Error('City not found');
      }
      const geoData = await geoResponse.json();
      
      if (!geoData || geoData.length === 0) {
          throw new Error('No results for this city');
      }

      const { lat, lon, name, country } = geoData[0];
      
      
      await getWeatherByCoordinates(lat, lon, name, country);
      
  } catch (error) {
        console.error('Search error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Search Error',  
            text: error.message || 'Failed to find the city',  
            confirmButtonText: 'OK'  
      });
  } finally {
      loadingIndicator.style.display = 'none';
  }
}

async function getWeatherByCoordinates(lat, lon, name, country) {
  try {
      
      const weatherResponse = await fetch(`/api/current-weather?latitude=${lat}&longitude=${lon}`);
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
      
      const weatherData = await weatherResponse.json();
      updateWeatherUI(weatherData);
      
      
      const aqiResponse = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      if (aqiResponse.ok) {
          const aqiData = await aqiResponse.json();
          updateAQIUI(aqiData);
      }
      
      
      const forecastResponse = await fetch(`/api/forecast/${encodeURIComponent(name)}`);
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
      
      const forecastData = await forecastResponse.json();
      updateForecastUI(forecastData);
      
    
      currentCity = {
          name: name,
          lat: lat,
          lon: lon,
          country: country
      };
      
  } catch (error) {
      console.error('Weather fetch error:', error);
      throw error;
  }
}


// Get Weather Data
async function getWeatherDetails(cityName) {
    try {
        loadingIndicator.style.display = 'flex';
        
        // Get current weather
        const weatherResponse = await fetch(`/api/weather/${encodeURIComponent(cityName)}`);
        if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
        
        const weatherData = await weatherResponse.json();
        updateWeatherUI(weatherData);
        
        // Get air quality data
        if (weatherData.fullData?.coord) {
            const aqiResponse = await fetch(`/api/air-quality?lat=${weatherData.fullData.coord.lat}&lon=${weatherData.fullData.coord.lon}`);
            if (aqiResponse.ok) {
                const aqiData = await aqiResponse.json();
                updateAQIUI(aqiData);
            }
        }
        
        // Get forecast
        const forecastResponse = await fetch(`/api/forecast/${encodeURIComponent(cityName)}`);
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
        
        const forecastData = await forecastResponse.json();
        updateForecastUI(forecastData);
        
        currentCity = {
            name: weatherData.requestedData.city,
            lat: weatherData.fullData.coord.lat,
            lon: weatherData.fullData.coord.lon,
            country: weatherData.fullData.sys.country
        };
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch weather data',
            confirmButtonText: 'OK'
        });
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Update AQI UI
function updateAQIUI(aqiData) {
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqi = aqiData.list[0].main.aqi;
    const components = aqiData.list[0].components;
    
    document.getElementById('aqiCard').innerHTML = `
        <div class="card-head">
            <p>Air Quality Index</p>
            <p class="air-index aqi-${aqi}">${aqiLevels[aqi - 1]}</p>
        </div>
        <div class="air-indices">
            <i class="fa-regular fa-wind fa-3x"></i>
            <div class="item">
                <p>PM2.5</p>
                <h2>${components.pm2_5}</h2>
            </div>
            <div class="item">
                <p>PM10</p>
                <h2>${components.pm10}</h2>
            </div>
            <div class="item">
                <p>SO2</p>
                <h2>${components.so2}</h2>
            </div>
            <div class="item">
                <p>CO</p>
                <h2>${components.co}</h2>
            </div>
        </div>`;
}

// Update Weather UI
function updateWeatherUI(data) {
    const weather = data.requestedData || data;
    const fullData = data.fullData || data;
    
    document.querySelector('.current-weather h2').textContent = `${weather.temperature}°C`;
    document.querySelector('.current-weather p').textContent = weather.description;
    document.querySelector('.weather-icon img').src = `https://openweathermap.org/img/wn/${fullData.weather[0].icon}@2x.png`;
    
    const date = new Date();
    document.querySelector('.card-footer p:nth-child(1)').innerHTML = 
        `<i class="fa-light fa-calendar"></i>${date.toLocaleDateString()}`;
    document.querySelector('.card-footer p:nth-child(2)').innerHTML = 
        `<i class="fa-light fa-location-dot"></i>${weather.city}, ${fullData.sys.country}`;
    
    // Update other weather data
    document.getElementById('humidityVal').textContent = `${weather.humidity}%`;
    document.getElementById('pressureVal').textContent = `${fullData.main.pressure}hpa`;
    document.getElementById('visibilityVal').textContent = `${(fullData.visibility / 1000).toFixed(1)}km`;
    document.getElementById('windspeedVal').textContent = `${weather.windSpeed}m/s`;
    document.getElementById('feelsVal').textContent = `${fullData.main.feels_like.toFixed(1)}°C`;
    
    // Update sunrise/sunset
    const sunrise = new Date(fullData.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(fullData.sys.sunset * 1000).toLocaleTimeString();
    
    document.getElementById('sunriseCard').innerHTML = `
        <div class="card-head">
            <p>Sunrise & Sunset</p>
        </div>
        <div class="sunrise-sunset">
            <div class="item">
                <div class="icon">
                    <i class="fa-light fa-sunrise fa-4x"></i>
                </div>
                <div>
                    <p>Sunrise</p>
                    <h2>${sunrise}</h2>
                </div>
            </div>
            <div class="item">
                <div class="icon">
                    <i class="fa-light fa-sunset fa-4x"></i>
                </div>
                <div>
                    <p>Sunset</p>
                    <h2>${sunset}</h2>
                </div>
            </div>
        </div>`;
}

// Update Forecast UI
function updateForecastUI(data) {
    // Update 5-day forecast
    const forecastContainer = document.querySelector('.day-forcast');
    forecastContainer.innerHTML = data.forecast.map(day => `
        <div class="forcast-item">
            <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="" />
                <span>${day.main.temp.toFixed(1)}°C</span>
            </div>
            <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
            <p>${day.weather[0].description}</p>
        </div>`).join('');
    
    // Update hourly forecast (first 8 hours)
    const hourlyContainer = document.querySelector('.hourly-forcast');
    hourlyContainer.innerHTML = data.list.slice(0, 8).map(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit' });
        return `
        <div class="card">
            <p>${time}</p>
            <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="" />
            <p>${hour.main.temp.toFixed(1)}°C</p>
        </div>`;
    }).join('');
}



// Display Favorite Cities
 async function displayFavorites() {
  if (!currentUser) {
      console.log("User not logged in");
      return;
  }
  
  try {
      loadingIndicator.style.display = 'flex';
      const response = await fetch(`/api/favorites/${currentUser.id}`, {
          credentials: 'include'
      });
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Favorites data received:", data); // Debugging
      
      if (!data.favorites || !Array.isArray(data.favorites)) {
          throw new Error("Invalid favorites data format");
      }
      
      favoritesList.innerHTML = data.favorites.length > 0 
          ? data.favorites.map(city => `
              <div class="favorite-city" 
                   data-city="${city.city_name}"
                   data-lat="${city.latitude}"
                   data-lon="${city.longitude}">
                  ${city.city_name}
                  <span class="remove-btn" title="Remove from favorites">
                      <i class="fa-regular fa-trash-can"></i>
                  </span>
              </div>`
          ).join('')
          : '<p class="no-favorites">No favorite cities yet</p>';
      
    
      document.querySelectorAll('.favorite-city').forEach(item => {
          item.addEventListener('click', async (e) => {
              
              if (e.target.closest('.remove-btn')) {
                  return;
              }
              
              const cityName = item.dataset.city;
              const lat = item.dataset.lat;
              const lon = item.dataset.lon;
              
              try {
                  loadingIndicator.style.display = 'flex';
                  
                  
                  const weatherResponse = await fetch(`/api/current-weather?latitude=${lat}&longitude=${lon}`);
                  if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
                  
                  const weatherData = await weatherResponse.json();
                  updateWeatherUI(weatherData);
                  currentCity = {
                      name: cityName,
                      lat: lat,
                      lon: lon,
                      country: weatherData.fullData.sys.country
                  };
                  
              } catch (error) {
                  console.error('Error loading city:', error);
                  Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Failed to load city weather data',
                      confirmButtonText: 'OK'
                  });
              } finally {
                  loadingIndicator.style.display = 'none';
              }
          });
      });
      
      
      document.querySelectorAll('.remove-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
              e.stopPropagation(); 
              e.preventDefault(); 
              
              const cityElement = e.target.closest('.favorite-city');
              const cityName = cityElement.dataset.city;
              
              try {
                  const deleteResponse = await fetch(`/api/favorites/${currentUser.id}/${encodeURIComponent(cityName)}`, {
                      method: 'DELETE',
                      credentials: 'include'
                  });
                  
                  if (deleteResponse.ok) {
                      
                      cityElement.remove();
                      
                    
                      Swal.fire({
                          icon: 'success',
                          title: 'DELETED',
                          text: `delete ${cityName} from favorites `,
                          confirmButtonText: 'okey'
                      });
                      
                      
                      if (document.querySelectorAll('.favorite-city').length === 0) {
                          favoritesList.innerHTML = '<p class="no-favorites">No favorite cities yet</p>';
                      }
                  } else {
                      const errorData = await deleteResponse.json();
                      throw new Error(errorData.error || 'Failed to delete');
                  }
              } catch (error) {
                  console.error('Error deleting favorite:', error);
                  Swal.fire({
                      icon: 'error',
                      title: 'Search Error',  
                      text: error.message || 'Failed to find the city',  
                      confirmButtonText: 'OK'  
                  });
              }
          });
      });
      
  } catch (error) {
      console.error('Error fetching favorites:', error);
      favoritesList.innerHTML = `
          <p class="error-message">
              Failed to load favorites: ${error.message}
          </p>`;
  } finally {
      loadingIndicator.style.display = 'none';
  }
} 

// Add Favorite City
 async function addFavorite() {
    if (!currentUser || !currentCity) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot add favorite',
            text: 'Please select a city first',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    try {
        loadingIndicator.style.display = 'flex';
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                city: currentCity.name,
                latitude: currentCity.lat,
                longitude: currentCity.lon
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add favorite');
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'City added to favorites',
            confirmButtonText: 'OK'
        });
        
        displayFavorites();
        
    } catch (error) {
        console.error('Error adding favorite:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to add city to favorites',
            confirmButtonText: 'OK'
        });
    } finally {
        loadingIndicator.style.display = 'none';
    }
} 

// Get Weather by Current Location
async function getWeatherByLocation() {
    try {
        loadingIndicator.style.display = 'flex';
        
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        
        const response = await fetch(`/api/current-weather?latitude=${latitude}&longitude=${longitude}`);
        if (!response.ok) throw new Error('Failed to fetch weather');
        
        const data = await response.json();
        updateWeatherUI(data);
        
        if (data.fullData?.coord) {
            const aqiResponse = await fetch(`/api/air-quality?lat=${data.fullData.coord.lat}&lon=${data.fullData.coord.lon}`);
            if (aqiResponse.ok) {
                const aqiData = await aqiResponse.json();
                updateAQIUI(aqiData);
            }
        }
        
        const forecastResponse = await fetch(`/api/forecast/${encodeURIComponent(data.city)}`);
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
        
        const forecastData = await forecastResponse.json();
        updateForecastUI(forecastData);
        
        currentCity = {
            name: data.city,
            lat: data.fullData.coord.lat,
            lon: data.fullData.coord.lon,
            country: data.fullData.sys.country
        };
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch weather data',
            confirmButtonText: 'OK'
        });
        
        // Fallback to default city
        await getWeatherByCity('Riyadh');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Load Default Location
async function loadDefaultLocation() {
    try {
        await getWeatherByLocation();
    } catch (error) {
        console.error('Error getting location:', error);
        await getWeatherByCity('Riyadh');
    }
}

// Logout Function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '../index.html';
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Logout Failed',
            text: error.message || 'Failed to logout',
            confirmButtonText: 'OK'
        });
    }
}

// Event Listeners
searchBtn.addEventListener('click', searchCity);

locationBtn.addEventListener('click', getWeatherByLocation);

cityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchCity();
    }
});

addFavoriteBtn.addEventListener('click', addFavorite);
logoutBtn.addEventListener('click', logout);