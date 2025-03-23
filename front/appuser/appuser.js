let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  api_key = "7ca6de5baa4691d978e58292e599b4e3"; // تأكد من أن المفتاح صحيح

function getWeatherDetails(name, lat, lon, country, state) {
  let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
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
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data); // عرض بيانات الطقس في الـ console

      // عرض بيانات الطقس في الصفحة
      let date = new Date();
      let weatherCard = document.querySelector(".weather-left .card");
      if (weatherCard) {
        weatherCard.innerHTML = `
          <div class="current-weather">
            <div class="details">
              <p>Now</p>
              <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
              <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
              <img src="https://openweathermap.org/img/wn/${
                data.weather[0].icon
              }@2x.png" alt="" />
            </div>
          </div>
          <hr />
          <div class="card-footer">
            <p><i class="fa-light fa-calendar"></i>${
              days[date.getDay()]
            }, ${date.getDate()}, ${
          months[date.getMonth()]
        }, ${date.getFullYear()}</p>
            <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
          </div>
        `;
      } else {
        console.error("Weather card element not found in the DOM");
      }

      // تحديث العناصر الأخرى
      document.getElementById(
        "humidityVal"
      ).textContent = `${data.main.humidity}%`;
      document.getElementById(
        "pressureVal"
      ).textContent = `${data.main.pressure}hpa`;
      document.getElementById(
        "windspeedVal"
      ).textContent = `${data.wind.speed}m/s`;
      document.getElementById("feelsVal").textContent = `${(
        data.main.feels_like - 273.15
      ).toFixed(2)}&deg;C`;
      document.getElementById("visibilityVal").textContent = `${(
        data.visibility / 1000
      ).toFixed(1)}km`;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      alert("Failed to fetch current weather");
    });
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;

  let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(GEOCODING_API_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      if (data.length === 0) {
        alert("City not found");
        return;
      }
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch((error) => {
      console.error("Error fetching city coordinates:", error);
      alert(`Failed to fetch coordinates of ${cityName}`);
    });
}

// إضافة حدث النقر على زر البحث
searchBtn.addEventListener("click", getCityCoordinates);

// (اختياري) إضافة حدث عند الضغط على Enter في حقل الإدخال
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getCityCoordinates();
  }
});