/* let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
 
  currentWeatherCard = document.querySelectorAll(".weather_left .card")[0];
  const  api_key = "9af42213ce288a708c0720141f1be1cb"
function getWeatherDetails(name, lat, lon, country, state) {
  
  let FORCAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${api_key}`,
    
    days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // console.log(data); // عرض بيانات الطقس في الـ console
      let date = new Date();
      //error
      currentWeatherCard.innerHTML = `

      <div class="current-weather">
              <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                <p>${data.weather[0].description}</p>
              </div>
              <div class="weather-icon">
                <img
                  src="https://openweathermap.org/img/wn/${
                    data.weather[0].icon
                  }@2x.png"
                  alt=""
                />
              </div>
            </div>
            <hr />
            <div class="card-footer">
              <p><i class="fa-light fa-calendar"></i>${
                days[date.getDay()]
              }, ${date.getDate()}, ${
        months[date.getMonth()]
      }, ${date.getFullYear()}</p>
              <p><i class="fa-light fa-location-dot"></i>${name},${country}</p>
            </div>
      </div>`;
    })
    .catch(() => {
      alert("Failed to fetch current weather");
    });
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;

  let GEOCOGING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCOGING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log(data); // عرض البيانات القادمة من Geo API في الـ console
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() => {
      alert(`Failed to fetch coordinates of ${cityName}`);
    });
}

searchBtn.addEventListener("click", getCityCoordinates) */


let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  currentWeatherCard = document.querySelector(".weather_left .card");

const api_key = "9af42213ce288a708c0720141f1be1cb";

function getWeatherDetails(name, lat, lon, country, state) {
  let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let date = new Date();
      currentWeatherCard.innerHTML = `
        <div class="current-weather">
          <div class="details">
            <p>Now</p>
            <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
            <p>${data.weather[0].description}</p>
          </div>
          <div class="weather-icon">
            <img
              src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
              alt=""
            />
          </div>
        </div>
        <hr />
        <div class="card-footer">
          <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]}, ${date.getFullYear()}</p>
          <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
        </div>
      `;
    })
    .catch(() => {
      alert("Failed to fetch current weather");
    });
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;

  let GEOCOGING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCOGING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data || data.length === 0) {
        alert(`City "${cityName}" not found`);
        return;
      }
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() => {
      alert(`Failed to fetch coordinates of ${cityName}`);
    });
}

searchBtn.addEventListener("click", getCityCoordinates);