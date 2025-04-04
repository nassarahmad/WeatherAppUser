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

const apiCityInput = document.getElementById('apiCity');

// Fetch all users
async function fetchUsers() {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
      }
    });

    if (response.ok) {
      const data = await response.json();
      renderUserManagementTable(data.users);
    } else {
      alert('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Failed to fetch users');
  }
}

// Render User Management Table
function renderUserManagementTable(users) {
  const userTableBody = document.querySelector('#userManagementTable tbody');
  userTableBody.innerHTML = '';

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.is_admin ? 'Yes' : 'No'}</td>
      
      <td>
        <button class="edit" onclick="editUser(${user.id})">Edit</button>
        <button class="delete" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
}

// Edit User
async function editUser(userId) {
  const username = prompt('Enter new username:');
  const email = prompt('Enter new email:');
 

  if (username && email) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username, email })
      });

      if (response.ok) {
        alert('User updated successfully');
        fetchUsers();
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  }
}

async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  }
}

// Fetch Users on Page Load
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();
});