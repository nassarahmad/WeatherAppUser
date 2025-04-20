
const API_KEY = '9af42213ce288a708c0720141f1be1cb';

let currentUserId = null;

// DOM Elements
const alertContainer = document.getElementById('alertContainer');
const confirmationModal = document.getElementById('confirmationModal');
const modalMessage = document.getElementById('modalMessage');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const editUserModal = document.getElementById('editUserModal');
const editUsername = document.getElementById('editUsername');
const editEmail = document.getElementById('editEmail');
const editIsAdmin = document.getElementById('editIsAdmin');
const editCancelBtn = document.getElementById('editCancelBtn');
const editSaveBtn = document.getElementById('editSaveBtn');

// Show Alert Function
function showAlert(type, message) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  let icon;
  switch(type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
  }
  
  alert.innerHTML = `
    ${icon}
    <div>${message}</div>
    <button class="close-alert">&times;</button>
  `;
  
  alertContainer.appendChild(alert);
  
  // Show alert with animation
  setTimeout(() => {
    alert.classList.add('show');
  }, 10);
  
  // Close button functionality
  const closeBtn = alert.querySelector('.close-alert');
  closeBtn.addEventListener('click', () => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 5000);
}

// Show Confirmation Modal
function showConfirmation(message, callback) {
  modalMessage.textContent = message;
  confirmationModal.classList.add('active');
  
  const handleConfirm = () => {
    confirmationModal.classList.remove('active');
    callback(true);
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', handleCancel);
  };
  
  const handleCancel = () => {
    confirmationModal.classList.remove('active');
    callback(false);
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', handleCancel);
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);
}

// Close Modal Handlers
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay').classList.remove('active');
  });
});

// Fetch all users
async function fetchUsers() {
  try {
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    });

    if (response.ok) {
      const data = await response.json();
      renderUserManagementTable(data.users);
    } else {
      showAlert('error', 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    showAlert('error', 'Failed to fetch users');
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
      <td class="table-actions">
        <button class="action-btn edit-btn" onclick="openEditUserModal(${user.id}, '${user.username}', '${user.email}', ${user.is_admin})">
          <i class="fas fa-pencil-alt"></i> <span>Edit</span>
        </button>
        <button class="action-btn delete-btn" onclick="confirmDeleteUser(${user.id})">
          <i class="fas fa-trash"></i> <span>Delete</span>
        </button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
}

// Open Edit User Modal
function openEditUserModal(id, username, email, isAdmin) {
  currentUserId = id;
  editUsername.value = username;
  editEmail.value = email;
  editIsAdmin.value = isAdmin;
  editUserModal.classList.add('active');
}

// Save Edited User
editSaveBtn.addEventListener('click', async () => {
  if (!editUsername.value || !editEmail.value) {
    showAlert('error', 'Please fill all required fields');
    return;
  }

  try {
    const response = await fetch(`/api/users/${currentUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        username: editUsername.value, 
        email: editEmail.value,
        is_admin: editIsAdmin.value === 'true'
      })
    });

    if (response.ok) {
      showAlert('success', 'User updated successfully');
      editUserModal.classList.remove('active');
      fetchUsers();
    } else {
      const errorData = await response.json();
      showAlert('error', errorData.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    showAlert('error', 'Failed to update user');
  }
});

// Confirm Delete User
function confirmDeleteUser(userId) {
  showConfirmation('Are you sure you want to delete this user? This action cannot be undone.', async (confirmed) => {
    if (confirmed) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          showAlert('success', 'User deleted successfully');
          fetchUsers();
        } else {
          showAlert('error', 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('error', 'Failed to delete user');
      }
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();
  
  // Close modals when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
});


//

// Add to your DOM Elements section
const logoutBtn = document.getElementById('logoutBtn');

// Add this function
function handleLogout() {
  showConfirmation('Are you sure you want to logout?', (confirmed) => {
    if (confirmed) {
      // Clear any user session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show logout message
      showAlert('success', 'Logged out successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
    }
  });
}

// Add event listener
logoutBtn.addEventListener('click', handleLogout);




