


const API_KEY = '9af42213ce288a708c0720141f1be1cb'; // Your OpenWeatherMap API Key

let weatherData = [];
let userData = [];
let editIndex = null;

// DOM Elements
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('city');
const tempInput = document.getElementById('temperature');
const conditionInput = document.getElementById('condition');
const humidityInput = document.getElementById('humidity');
const windSpeedInput = document.getElementById('windSpeed');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const weatherTableBody = document.querySelector('#weatherTable tbody');

const userForm = document.getElementById('userForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('passwordInput');
const userTableBody = document.querySelector('#userTable tbody');

const apiCityInput = document.getElementById('apiCity');











// Handle Sign Up Form Submission
document.getElementById('userForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('passwordInput').value;

  fetch('/api/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
  })
      .then(response => response.json())
      .then(data => {
          if (data.token) {
              Swal.fire({
                  icon: 'success',
                  title: 'Registration Successful!',
                  text: 'You have been successfully registered.',
                  confirmButtonText: 'OK'
              }).then(() => {
                  window.location.href = '/index.html'; // Redirect to user page after successful registration
              });
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Registration Failed',
                  text: data.error || 'Registration failed',
                  confirmButtonText: 'OK'
              });
          }
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire({
              icon: 'error',
              title: 'Registration Failed',
              text: 'An error occurred during registration.',
              confirmButtonText: 'OK'
          });
      });
});













// Fetch Weather Data from OpenWeatherMap API
async function fetchWeather() {
  const city = apiCityInput.value;
  if (!city) {
    alert('Please enter a city name.');
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      // Populate the form with fetched data
      cityInput.value = data.name;
      tempInput.value = data.main.temp;
      conditionInput.value = data.weather[0].main;
      humidityInput.value = data.main.humidity;
      windSpeedInput.value = data.wind.speed;
    } else {
      alert('City not found. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to fetch weather data. Please try again.');
  }
}

// Weather Form Submit Event
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value;
  const temperature = tempInput.value;
  const condition = conditionInput.value;
  const humidity = humidityInput.value;
  const windSpeed = windSpeedInput.value;

  if (editIndex === null) {
    // Add new weather data
    weatherData.push({ city, temperature, condition, humidity, windSpeed });
  } else {
    // Update existing weather data
    weatherData[editIndex] = { city, temperature, condition, humidity, windSpeed };
    editIndex = null;
    addBtn.style.display = 'inline';
    updateBtn.style.display = 'none';
  }

  renderWeatherTable();
  weatherForm.reset();
});

// Render Weather Table
function renderWeatherTable() {
  weatherTableBody.innerHTML = '';
  weatherData.forEach((data, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.city}</td>
      <td>${data.temperature} °C</td>
      <td>${data.condition}</td>
      <td>${data.humidity}%</td>
      <td>${data.windSpeed} km/h</td>
      <td>
        <button class="edit" onclick="editWeather(${index})">Edit</button>
        <button class="delete" onclick="deleteWeather(${index})">Delete</button>
      </td>
    `;
    weatherTableBody.appendChild(row);
  });
}

// Edit Weather
function editWeather(index) {
  const { city, temperature, condition, humidity, windSpeed } = weatherData[index];
  cityInput.value = city;
  tempInput.value = temperature;
  conditionInput.value = condition;
  humidityInput.value = humidity;
  windSpeedInput.value = windSpeed;
  editIndex = index;
  addBtn.style.display = 'none';
  updateBtn.style.display = 'inline';
}

// Delete Weather
function deleteWeather(index) {
  weatherData.splice(index, 1);
  renderWeatherTable();
}

// User Form Submit Event
userForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Check for duplicate users
  const isDuplicate = userData.some(
    (user) => user.username === username || user.email === email
  );

  if (isDuplicate) {
    alert('A user with the same username or email already exists.');
    return;
  }

  // Add new user
  userData.push({ username, email, password });
  renderUserTable();
  userForm.reset();
});

// Render User Table
function renderUserTable() {
  userTableBody.innerHTML = '';
  userData.forEach((user, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>******</td> <!-- Masked password -->
      <td>
        <button class="delete" onclick="deleteUser(${index})">Delete</button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
}

// Delete User
function deleteUser(index) {
  userData.splice(index, 1);
  renderUserTable();
}





// Initial Render
renderWeatherTable();
renderUserTable();

