const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function withQuery(path, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })

  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

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

export function requestOtp(payload) {
  return request('/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyOtp(payload) {
  return request('/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getDashboardStats(params = {}) {
  return request(withQuery('/transactions/dashboard-stats/', params))
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
  const { params = {}, ...body } = payload || {}
  return request(withQuery(`/loans/requests/${requestId}/evaluate/`, params), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function approveLoanRequest(requestId, payload = {}) {
  const { params = {}, ...body } = payload || {}
  return request(withQuery(`/loans/requests/${requestId}/approve/`, params), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function rejectLoanRequest(requestId, payload = {}) {
  const { params = {}, ...body } = payload || {}
  return request(withQuery(`/loans/requests/${requestId}/reject/`, params), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getLoans(params = {}) {
  return request(withQuery('/loans/requests/', params))
}

export function getTransactions(params = {}) {
  return request(withQuery('/transactions/', params))
}

export function getAdminUsers(params = {}) {
  return request(withQuery('/admin/users/', params))
}

export function getModelMonitoring() {
  return request('/admin/model-monitoring/')
}

export function getTrustProfiles(params = {}) {
  return request(withQuery('/trust/profiles/', params))
}

export function getNotifications(params = {}) {
  return request(withQuery('/notifications/', params))
}

export function markNotificationRead(notificationId, params = {}) {
  return request(withQuery(`/notifications/${notificationId}/mark-read/`, params), {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getRiskAlerts(params = {}) {
  return request(withQuery('/risk/alerts/', params))
}

export function resolveRiskAlert(alertId, params = {}) {
  return request(withQuery(`/risk/alerts/${alertId}/resolve/`, params), {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getFraudFeedback(params = {}) {
  return request(withQuery('/fraud/feedback/', params))
}

export function setFraudFeedbackActualOutcome(feedbackId, payload = {}) {
  const { params = {}, ...body } = payload || {}
  return request(withQuery(`/fraud/feedback/${feedbackId}/actual-outcome/`, params), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function adminScope(adminPhone) {
  return {
    admin_view: true,
    admin_phone: adminPhone,
  }
}

export function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}