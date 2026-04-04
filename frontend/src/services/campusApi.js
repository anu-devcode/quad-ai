const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const detail = payload?.detail || payload?.message || `Request failed with status ${response.status}`
    const error = new Error(detail)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export function getVerificationReport() {
  return request('/verification/report/')
}

export function getDashboardStats() {
  return request('/transactions/dashboard-stats/')
}

export function predictFraud(payload) {
  return request('/predict/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function orchestrateTransaction(payload) {
  if (payload instanceof FormData) {
    return request('/transactions/orchestrate/', {
      method: 'POST',
      body: payload,
    })
  }

  return request('/transactions/orchestrate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createLoanRequest(payload) {
  return request('/loans/requests/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function evaluateLoanRequest(requestId, payload = {}) {
  return request(`/loans/requests/${requestId}/evaluate/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function approveLoanRequest(requestId, payload = {}) {
  return request(`/loans/requests/${requestId}/approve/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function rejectLoanRequest(requestId, payload = {}) {
  return request(`/loans/requests/${requestId}/reject/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getLoans() {
  return request('/loans/requests/')
}

export function getTransactions() {
  return request('/transactions/')
}

export function getAdminUsers() {
  return request('/admin/users/')
}

export function getModelMonitoring() {
  return request('/admin/model-monitoring/')
}

export function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}