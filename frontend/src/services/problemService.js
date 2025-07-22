
export async function submitSolution({ userId, problemId, code, language, violations, mode, elapsedTime }) {
  const response = await fetch('https://code-clash-s9vq.onrender.com/api/submissions/submit', {
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
  const response = await fetch(`https://code-clash-s9vq.onrender.com/api/submissions/history?userId=${userId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions || [];
}

export async function getUserProblemSubmissions(userId, problemId) {
  const response = await fetch(`https://code-clash-s9vq.onrender.com/api/submissions/history?userId=${userId}&problemId=${problemId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions || [];
}

export async function getProblemParticipants(problemId) {
  const response = await fetch(`https://code-clash-s9vq.onrender.com/api/submissions/participants/${problemId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch participants');
  }
  const data = await response.json();
  return data.participants || [];
}

