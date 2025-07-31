const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


export const getUserStreak = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/streak/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Streak API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch streak data');
    }

    const data = await response.json();
    return data.streak;
  } catch (error) {
    console.error('Error fetching streak:', error);
    throw error;
  }
};

export const getCalendarData = async (token, year, month) => {
  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const response = await fetch(`${API_BASE_URL}/api/streak/calendar?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch calendar data');
    }

    const data = await response.json();
    return data.calendar;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw error;
  }
};

export const useStreakFreeze = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/streak/freeze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to use streak freeze');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error using streak freeze:', error);
    throw error;
  }
};

export const getStreakLeaderboard = async () => {
  const response = await fetch(`${API_BASE_URL}/api/streak/leaderboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data = await response.json();
  return data.leaderboard;
};