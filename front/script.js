const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const forgotPasswordButton = document.getElementById('forgetpassword');
const backToSignInButton = document.getElementById('backToSignIn');
const container = document.getElementById('container');

// Event listeners for button clicks
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
    container.classList.remove("forgot-password-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
    container.classList.remove("forgot-password-active");
});

forgotPasswordButton.addEventListener('click', () => {
    container.classList.add("forgot-password-active");
    container.classList.remove("right-panel-active");
});

backToSignInButton.addEventListener('click', () => {
    container.classList.remove("forgot-password-active");
});

// Handle Sign In Form Submission
document.getElementById('Sign_in_Form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                sendLoginRequest(username, password, latitude, longitude);
            },
            (error) => {
                console.error("Failed to get location:", error);
                sendLoginRequest(username, password, null, null);
            }
        );
    } else {
        console.error("Browser does not support Geolocation API");
        sendLoginRequest(username, password, null, null);
    }
});

// Handle Sign Up Form Submission
document.getElementById('Sign_up_Form').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('SUsername').value;
    const email = document.getElementById('SEmail').value;
    const password = document.getElementById('Spassword').value;

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

// Handle Forgot Password Form Submission
document.getElementById('forgot_Password_Form').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value;
    const username = document.getElementById('forgotusername').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, newPassword })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Successful!',
                    text: data.message,
                    confirmButtonText: 'OK'
                }).then(() => {
                    container.classList.remove("forgot-password-active"); // Return to sign-in form after successful password reset
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Password Reset Failed',
                    text: data.error || 'Failed to reset password',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Password Reset Failed',
                text: 'An error occurred while resetting the password.',
                confirmButtonText: 'OK'
            });
        });
});

// Function to send login request
function sendLoginRequest(username, password, latitude, longitude) {
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, latitude, longitude })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: data.message,
                    confirmButtonText: 'OK'
                }).then(() => {
                    if (data.isAdmin) {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/wither.html';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.error,
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'An error occurred during login.',
                confirmButtonText: 'OK'
            });
        });
}




//
document.addEventListener('DOMContentLoaded', function () {
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherInfo = document.getElementById('weather-info');
    const favoriteCityInput = document.getElementById('favorite-city-input');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');
    const favoriteList = document.getElementById('favorite-list');
    const forecastInfo = document.getElementById('forecast-info');
    const logoutBtn = document.getElementById('logout-btn');
  
    let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
  
    // Fetch current weather
    getWeatherBtn.addEventListener('click', () => {
        const city = cityInput.value;
        if (city) {
            fetchWeather(city);
        }
    });
  
    // Add favorite city
    addFavoriteBtn.addEventListener('click', () => {
        const city = favoriteCityInput.value;
        if (city && !favoriteCities.includes(city)) {
            favoriteCities.push(city);
            localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
            updateFavoriteList();
        }
    });
  
    // Update favorite list
    function updateFavoriteList() {
        favoriteList.innerHTML = '';
        favoriteCities.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                favoriteCities = favoriteCities.filter(c => c !== city);
                localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
                updateFavoriteList();
            });
            li.appendChild(deleteBtn);
            favoriteList.appendChild(li);
        });
    }
  
    // Fetch weather data
    function fetchWeather(city) {
        const apiKey = '9af42213ce288a708c0720141f1be1cb'; // Replace with your actual API key
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  
        fetch(currentWeatherUrl)
            .then(response => response.json())
            .then(data => {
                weatherInfo.innerHTML = `
                    <p>City: ${data.name}</p>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Weather: ${data.weather[0].description}</p>
                `;
            })
            .catch(error => {
                console.error('Error fetching current weather:', error);
            });
  
        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                forecastInfo.innerHTML = '';
                for (let i = 0; i < data.list.length; i += 8) {
                    const forecast = data.list[i];
                    const date = new Date(forecast.dt * 1000);
                    forecastInfo.innerHTML += `
                        <div>
                            <p>Date: ${date.toDateString()}</p>
                            <p>Temperature: ${forecast.main.temp}°C</p>
                            <p>Weather: ${forecast.weather[0].description}</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching forecast:', error);
            });
    }
  
    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); // Assuming you store a token for authentication
        window.location.href = '/index.html'; // Redirect to login page
    });
  
    // Initial update of favorite list
    updateFavoriteList();
  });