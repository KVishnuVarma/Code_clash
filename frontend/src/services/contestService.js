export const getUserRegisteredContests = async (userId) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/user/registered?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch registered contests');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching registered contests:', error);
    throw error;
  }
};

export const getAllContests = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch contests');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw error;
  }
};

export const registerForContest = async (contestId) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contest/${contestId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.details || 'Failed to register for contest');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}; 