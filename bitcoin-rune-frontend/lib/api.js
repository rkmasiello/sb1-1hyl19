const API_BASE_URL = 'http://localhost:3003';

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Registration failed. Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const applyReferral = async (referralCode, newUserId) => {
  const response = await fetch(`${API_BASE_URL}/referral/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ referralCode, newUserId }),
  });
  return response.json();
};

export const loginUser = async (loginData) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
  return response.json();
};

export const updatePoints = async (userId, pointsToAdd) => {
  const response = await fetch(`${API_BASE_URL}/points/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, pointsToAdd }),
  });
  return response.json();
};

export const getPoints = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/points/${userId}`, {
    method: 'GET',
  });
  return response.json();
};

export const getReferralInfo = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/referral/${userId}`, {
    method: 'GET',
  });
  return response.json();
};

export const getLeaderboard = async () => {
  const response = await fetch(`${API_BASE_URL}/leaderboard`, {
    method: 'GET',
  });
  return response.json();
};