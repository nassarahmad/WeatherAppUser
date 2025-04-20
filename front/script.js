const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const forgotPasswordButton = document.getElementById("forgetpassword");
const backToSignInButton = document.getElementById("backToSignIn");
const container = document.getElementById("container");

// Event listeners for button clicks
signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
  container.classList.remove("forgot-password-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  container.classList.remove("forgot-password-active");
});

forgotPasswordButton.addEventListener("click", () => {
  container.classList.add("forgot-password-active");
  container.classList.remove("right-panel-active");
});

backToSignInButton.addEventListener("click", () => {
  container.classList.remove("forgot-password-active");
});

// Handle Sign In Form Submission
document
  .getElementById("Sign_in_Form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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
document
  .getElementById("Sign_up_Form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("SUsername").value;
    const email = document.getElementById("SEmail").value;
    const password = document.getElementById("Spassword").value;

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          Swal.fire({
            icon: "success",
            title: "Registration Successful!",
            text: "You have been successfully registered.",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.href = "/index.html"; // Redirect to user page after successful registration
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: data.error || "Registration failed",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: "An error occurred during registration.",
          confirmButtonText: "OK",
        });
      });
  });

// Handle Forgot Password Form Submission
document
  .getElementById("forgot_Password_Form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("forgotEmail").value;
    const username = document.getElementById("forgotusername").value;
    const newPassword = document.getElementById("newPassword").value;

    fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, newPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          Swal.fire({
            icon: "success",
            title: "Password Reset Successful!",
            text: data.message,
            confirmButtonText: "OK",
          }).then(() => {
            container.classList.remove("forgot-password-active"); // Return to sign-in form after successful password reset
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Password Reset Failed",
            text: data.error || "Failed to reset password",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Password Reset Failed",
          text: "An error occurred while resetting the password.",
          confirmButtonText: "OK",
        });
      });
  });

// Function to send login request
function sendLoginRequest(username, password, latitude, longitude) {
  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, latitude, longitude }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: data.message,
          draggable: true,
          confirmButtonText: "OK",
        }).then(() => {
          if (data.isAdmin) {
            window.location.href = "admindashboard/index.html";
          } else {
            window.location.href = "appuser/index.html";
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error,
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "An error occurred during login.",
        confirmButtonText: "OK",
      });
    });
}


// Initialize with default weather
document.addEventListener('DOMContentLoaded', () => {
  fetchWeather('London'); 
});