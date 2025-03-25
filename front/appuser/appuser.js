let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  locationBtn = document.getElementById("locationBtn"),
  api_key = "7ca6de5baa4691d978e58292e599b4e3",
  currentWeatherCard = document.querySelectorAll(".weather-left .card")[0],
  fiveDaysForcastCard = document.querySelector(".day-forcast"),
  aqiCard = document.querySelectorAll(" .highlights .card")[0],
  sunriseCard = document.querySelectorAll(" .highlights .card")[1],
  humidityVal = document.getElementById("humidityVal"),
  pressureVal = document.getElementById("pressureVal"),
  visibilityVal = document.getElementById("visibilityVal"),
  windspeedVal = document.getElementById("windspeedVal"),
  feelsVal = document.getElementById("feelsVal"),
  hourlyForecastCard = document.querySelector(" .hourly-forcast"),
  aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

function getWeatherDetails(name, lat, lon, country, state) {
  // api_key = "b6d0a94eb85f8009c3528934779f9fc7";
  //error apis******************************
  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    AIR_POLLUTION_API_URL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
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

  //AIR_POLLUTION_API_URL*********************************
  fetch(AIR_POLLUTION_API_URL)
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
      aqiCard.innerHTML = ` <div class="card-head">
                <p>Air Quality Index</p>
                <p class="air-index aqi-${data.list[0].main.aqi}">${
        aqiList[data.list[0].main.aqi - 1]
      }</p>
                <!-- the color is wrong -->
              </div>
              <div class="air-indices">
                <i class="fa-regular fa-wind fa-3x"></i>
                <div class="item">
                  <p>PM2.5</p>
                  <h2>${pm2_5}</h2>
                </div>
                <div class="item">
                  <p>PM10</p>
                  <h2>${pm10}</h2>
                </div>
                <div class="item">
                  <p>SO2</p>
                  <h2>${so2}</h2>
                </div>
                <div class="item">
                  <p>CO</p>
                  <h2>${co}</h2>
                </div>
                <div class="item">
                  <p>NO</p>
                  <h2>${no}</h2>
                </div>
                <div class="item">
                  <p>NO2</p>
                  <h2>${no2}</h2>
                </div>
                <div class="item">
                  <p>NH3</p>
                  <h2>${nh3}</h2>
                </div>
                <div class="item">
                  <p>O3</p>
                  <h2>${o3}</h2>
                </div>
              </div>`;
    })
    .catch(() => {
      alert("Failed to fetch Air Quality Index");
    });

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // console.log(data); // عرض بيانات الطقس في الـ console
      let date = new Date();
      //error
      currentWeatherCard.innerHTML = `<div class="current-weather">
              <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                <p>${data.weather[0].description}</p>
              </div>
              <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${
                  data.weather[0].icon
                }@2x.png"
                  alt=""/>
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
      let { sunrise, sunset } = data.sys,
        { timezone, visibility } = data,
        { humidity, pressure, feels_like } = data.main,
        { speed } = data.wind,
        sRiseTime = moment
          .utc(sunrise, "X")
          .add(timezone, "second")
          .format("hh:mm A"),
        sSetTime = moment
          .utc(sunset, "X")
          .add(timezone, "second")
          .format("hh:mm A");
      sunriseCard.innerHTML = `
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
                    <h2>${sRiseTime}</h2>
                  </div>
                </div>
                <div class="item">
                  <div class="icon">
                    <i class="fa-light fa-sunset fa-4x"></i>
                  </div>
                  <div>
                    <p>Sunset</p>
                    <h2>${sSetTime}</h2>
                  </div>
                </div>
              </div>`;
      humidityVal.innerHTML = `${humidity}%`;
      pressureVal.innerHTML = `${pressure}hpa`;
      visibilityVal.innerHTML = `${visibility / 1000}km`;
      windspeedVal.innerHTML = `${speed}m/s`;
      feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;c`;
    })
    .catch(() => {
      alert("Failed to fetch current weather");
    });

  //big error ********************/*/*/*/*/*/*/**/************************/*/*/*/************ */ */ */
   fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      let hourlyForecast = data.list;
      hourlyForecastCard.innerHTML = ``;
      for (let i = 0; i <= 7; i++) {
        let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
        let hr = hrForecastDate.getHours();
        let a = "PM";
        if (hr < 12) a = "AM";
        if (hr == 0) hr = 12;
        if (hr > 12) hr = hr - 12;
        hourlyForecastCard.innerHTML += `
         <div class="card">
              <p>${hr} ${a}</p>
              <img src="https://openweathermap.org/img/wn/${
                hourlyForecast[i].weather[0].icon
              }.png" alt="" />
              <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
            </div>
        `;
      }
       let uniqueForcastdAYS = [];
      let fiveDaysForcast = data.list.filter((forcast) => {
        let forcastDate = new Date(forcast.dt_txt).getDate();
        if (!uniqueForcastdAYS.includes(forcastDate)) {
          return uniqueForcastdAYS.push(forcastDate);
        }
      }); 
     
      //console.log(fiveDaysForcast)
      fiveDaysForcastCard.innerHTML = "";
      for ( i = 1; i < fiveDaysForcast.length; i++) {
        let date = new Date(fiveDaysForcast[i].dt_txt);
        fiveDaysForcastCard.innerHTML += `
        
        <div class="forcast-item">
                <div class="icon-wrapper">
                  <img src="https://openweathermap.org/img/wn/${
                    fiveDaysForcast[i].weather[0].icon
                  }.png" alt="" />
                  <span>${(fiveDaysForcast[i].main.temp - 273.15).toFixed(
                    2
                  )}&deg;C</span>
                </div>
                <p>${date.getDate()} ${months[date.getMonth()]}</p>
                <p>${days[date.getDay()]}</p>
              </div>`;
      }
    })
    .catch(() => {
      alert("Failed to fetch weather forcast");
    });
  }

    
//error////////*****/**/*/*/*/*/******************************** */ */ */

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;
  let GEOCOGING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

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
function getUserCoordinates() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          //console.log(data);
          let { name, country, state } = data[0];
          getWeatherDetails(name, latitude, longitude, country, state);
        })
        .catch(() => {
          alert(`Failed to fetch REVERSE_GEOCODING_URL`);
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation permission denied. please reset location permission to grant access again"
        );
      }
    }
  );
}
searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
window.addEventListener("load", getCityCoordinates());
