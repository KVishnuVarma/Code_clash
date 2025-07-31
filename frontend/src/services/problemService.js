
export async function submitSolution({ userId, problemId, code, language, violations, mode, elapsedTime }) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, problemId, code, language, violations, mode, elapsedTime })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Submission failed');
  }
  return response.json();
}

export async function getUserSubmissions(userId) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/history?userId=${userId}&limit=100`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions || [];
}

export async function getUserProblemSubmissions(userId, problemId) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/history?userId=${userId}&problemId=${problemId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions || [];
}

export async function getProblemParticipants(problemId) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submissions/participants/${problemId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch participants');
  }
  const data = await response.json();
  return data.participants || [];
}

export async function getProblemById(problemId) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems/${problemId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch problem');
  }
  const data = await response.json();
  return data; // The backend returns the problem directly, not wrapped in a problem property
}

