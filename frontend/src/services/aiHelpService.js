// AI Help Service: Calls backend for error fix, review, and discussion using fetch with .then()

export function getErrorFix({ userId, problemId, code, language }) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/aihelp/error-fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, problemId, code, language })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err));
      return res.json();
    });
}

export function getReview({ userId, problemId, code, language }) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/aihelp/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, problemId, code, language })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err));
      return res.json();
    });
}

export function getDiscussion({ userId }) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/aihelp/discussion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err));
      return res.json();
    });
}

export function getGuideLines({ userId }) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/aihelp/guidelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err));
      return res.json();
    });
} 