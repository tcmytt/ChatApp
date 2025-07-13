# ChatApp Backend API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication Flow

### 1. User Registration
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "avatarUrl": "/avatars/avatar1.png"  // Optional
}
```

**Response (Success - 200):**
```json
{
  "result": "SUCCESS",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatarUrl": "/avatars/avatar1.png"
  }
}
```

**Response (Error - 400):**
```json
{
  "result": "ERROR",
  "message": "Username already exists",
  "data": null
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "result": "SUCCESS",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer"
  }
}
```

**Response (Error - 400):**
```json
{
  "result": "ERROR",
  "message": "Invalid email or password",
  "data": null
}
```

### 3. Get User Profile
**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "result": "SUCCESS",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatarUrl": "/avatars/avatar1.png"
  }
}
```

### 4. Update User Profile
**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "username": "new_username",     // Optional
  "password": "newpassword123",   // Optional
  "avatarUrl": "/avatars/avatar2.png"  // Optional
}
```

**Response (Success - 200):**
```json
{
  "result": "SUCCESS",
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "new_username",
    "email": "john@example.com",
    "avatarUrl": "/avatars/avatar2.png"
  }
}
```

## Error Responses

### Validation Errors (400)
```json
{
  "result": "ERROR",
  "message": "Validation failed: {fieldName: errorMessage}",
  "data": null
}
```

### Authentication Errors (401)
```json
{
  "result": "ERROR",
  "message": "Invalid email or password",
  "data": null
}
```

### Not Found Errors (404)
```json
{
  "result": "ERROR",
  "message": "User not found",
  "data": null
}
```

### Server Errors (500)
```json
{
  "result": "ERROR",
  "message": "An unexpected error occurred: error details",
  "data": null
}
```

## Frontend Integration Guide

### 1. Store JWT Token
After successful login, store the JWT token:
```javascript
// Store token in localStorage
localStorage.setItem('authToken', response.data.token);

// Or in sessionStorage for session-only storage
sessionStorage.setItem('authToken', response.data.token);
```

### 2. Add Authorization Header
For all authenticated requests, include the token:
```javascript
const token = localStorage.getItem('authToken');

fetch('/api/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Handle Token Expiration
Check for 401 responses and redirect to login:
```javascript
if (response.status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

### 4. Axios Configuration (if using Axios)
```javascript
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:8080';

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5. React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.result === 'SUCCESS') {
        localStorage.setItem('authToken', data.data.token);
        await fetchUserProfile();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.result === 'SUCCESS') {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile();
    }
    setLoading(false);
  }, []);

  return { user, login, logout, loading };
};

export default useAuth;
```

## Validation Rules

### Username
- Required
- 3-50 characters
- Must be unique

### Email
- Required
- Must be valid email format
- Must be unique
- Automatically converted to lowercase

### Password
- Required for registration
- Minimum 6 characters
- Hashed using BCrypt

### Avatar URL
- Optional
- Default: "/avatars/default.png"

## Security Notes

1. **JWT Token Expiration:** 24 hours (86400000 ms)
2. **Password Hashing:** BCrypt with salt
3. **CORS:** Configured for cross-origin requests
4. **CSRF:** Disabled for API endpoints
5. **Session:** Stateless (JWT-based)

## Testing with Postman/Insomnia

### 1. Register User
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Get Profile (with token)
```
GET http://localhost:8080/api/users/profile
Authorization: Bearer <token_from_login>
```

## Common Issues & Solutions

### 1. CORS Errors
If you get CORS errors, ensure your frontend is running on the correct port and the backend CORS configuration is set up properly.

### 2. Token Not Working
- Check if token is properly stored
- Verify token format: `Bearer <token>`
- Check if token has expired (24 hours)

### 3. Validation Errors
- Ensure all required fields are provided
- Check field length requirements
- Verify email format

### 4. Database Connection
- Ensure PostgreSQL is running on localhost:5432
- Verify database 'chatapp' exists
- Check credentials in application.properties

## Next Steps

After implementing authentication, the following APIs will be available:
- Room Management APIs
- Chat APIs (WebSocket)
- File Upload APIs
- Admin Dashboard APIs

Each will require the same JWT authentication pattern. 