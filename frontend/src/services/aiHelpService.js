// AI Help Service: Calls backend for error fix, review, and discussion using fetch with .then()

export function getErrorFix({ userId, problemId, code, language }) {
  return fetch('https://code-clash-s9vq.onrender.com/api/aihelp/error-fix', {
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
  return fetch('https://code-clash-s9vq.onrender.com/api/aihelp/review', {
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
  return fetch('https://code-clash-s9vq.onrender.com/api/aihelp/discussion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
    .then(res => {
      if (!res.ok) return res.json().then(err => Promise.reject(err));
      return res.json();
    });
} 