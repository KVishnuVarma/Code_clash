
export async function submitSolution({ userId, problemId, code, language, violations, mode, elapsedTime }) {
  const response = await fetch('http://localhost:5000/api/submissions/submit', {
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
  const response = await fetch(`http://localhost:5000/api/submissions/history?userId=${userId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch submissions');
  }
  const data = await response.json();
  return data.submissions || [];
}

