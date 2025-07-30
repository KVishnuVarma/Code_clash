const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getUserRegisteredContests = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contest/user/registered?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
    const response = await fetch(`${API_BASE_URL}/api/contest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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

export const registerForContest = async (contestId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contest/${contestId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register for contest');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering for contest:', error);
    throw error;
  }
}; 