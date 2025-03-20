const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


// Select the Sign In buttons
const signInButtonn = document.getElementById('signInButton');
const signInOverlay = document.getElementById('signInOverlay');

// Function to redirect to the weather app page
function redirectToWeatherApp() {
    window.location.href = 'weather-app.html'; // Replace with the actual path to your weather app page
}

// Add event listeners to both Sign In buttons
signInButtonn.addEventListener('click', redirectToWeatherApp);
signInOverlay.addEventListener('click', redirectToWeatherApp);



document.getElementById('signInForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Redirect to the weather app page on successful sign-in
            window.location.href = '/weather_app.html';
        } else {
            alert(data.message || 'Sign-in failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during sign-in');
    }
});


// Open the modal when "Forgot your password?" is clicked
document.querySelector('a[href="#"]').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('forgotPasswordModal').style.display = 'block';
});

// Close the modal when the close button is clicked
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
});

// Handle "Forgot Password" form submission
document.getElementById('forgotPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value;

    try {
        const response = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); // Show success message
            document.getElementById('forgotPasswordModal').style.display = 'none'; // Close the modal
        } else {
            alert(data.message || 'Failed to send reset email');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});