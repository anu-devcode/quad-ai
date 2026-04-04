import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'qued_verification_center_v1'

const seedSubmissions = [
  {
    id: 'VC-2001',
    ownerPhone: '+251911222333',
    ownerName: 'Selam A.',
    proofType: 'Bank Statement',
    title: 'February Salary Statement',
    notes: 'Official PDF from CBE showing monthly salary inflow and bill payments.',
    fileName: 'cbe-feb-statement.pdf',
    status: 'Pending',
    reviewedBy: null,
    reviewerNote: '',
    createdAt: '2026-04-03T09:15:00.000Z',
    reviewedAt: null,
  },
]

const seedLoanRequests = [
  {
    id: 'LR-3101',
    ownerPhone: '+251911222333',
    ownerName: 'Selam A.',
    requestedAmount: 3200,
    baseCeiling: 7400,
    adjustedCeiling: 7700,
    requestedUseVerificationLayer: true,
    status: 'Pending',
    applyVerificationLayer: null,
    adminNote: '',
    reviewedBy: null,
    createdAt: '2026-04-03T10:10:00.000Z',
    reviewedAt: null,
  },
]

const seedDecisionEvents = [
  {
    id: 'DE-9001',
    requestId: 'LR-3101',
    ownerName: 'Selam A.',
    ownerPhone: '+251911222333',
    decision: 'Approved',
    applyVerificationLayer: true,
    reviewerName: 'System Admin',
    note: 'Verified salary continuity and approved optional layer.',
    createdAt: '2026-04-03T11:24:00.000Z',
  },
]

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        submissions: seedSubmissions,
        loanRequests: seedLoanRequests,
        decisionEvents: seedDecisionEvents,
      }
    }

    const parsed = JSON.parse(raw)

    // Backward compatibility with old shape where only submissions were stored.
    if (Array.isArray(parsed)) {
      return {
        submissions: parsed,
        loanRequests: seedLoanRequests,
        decisionEvents: seedDecisionEvents,
      }
    }

    return {
      submissions: Array.isArray(parsed.submissions) && parsed.submissions.length ? parsed.submissions : seedSubmissions,
      loanRequests: Array.isArray(parsed.loanRequests) ? parsed.loanRequests : seedLoanRequests,
      decisionEvents: Array.isArray(parsed.decisionEvents) ? parsed.decisionEvents : seedDecisionEvents,
    }
  } catch {
    return {
      submissions: seedSubmissions,
      loanRequests: seedLoanRequests,
      decisionEvents: seedDecisionEvents,
    }
  }
}

const VerificationContext = createContext(null)

export function VerificationProvider({ children }) {
  const [state, setState] = useState(() => loadState())

  const submissions = state.submissions
  const loanRequests = state.loanRequests
  const decisionEvents = state.decisionEvents

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // no-op
    }
  }, [state])

  const submitProof = useCallback((payload) => {
    const now = new Date().toISOString()
    const entry = {
      id: `VC-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerPhone: payload.ownerPhone,
      ownerName: payload.ownerName,
      proofType: payload.proofType,
      title: payload.title,
      notes: payload.notes,
      fileName: payload.fileName,
      status: 'Pending',
      reviewedBy: null,
      reviewerNote: '',
      createdAt: now,
      reviewedAt: null,
    }

    setState((prev) => ({ ...prev, submissions: [entry, ...prev.submissions] }))
    return entry
  }, [])

  const reviewProof = useCallback((id, decision, reviewerName, reviewerNote = '') => {
    setState((prev) => ({
      ...prev,
      submissions: prev.submissions.map((item) =>
        item.id === id
          ? {
              ...item,
              status: decision,
              reviewedBy: reviewerName,
              reviewerNote,
              reviewedAt: new Date().toISOString(),
            }
          : item
      ),
    }))
  }, [])

  const submitLoanRequest = useCallback((payload) => {
    const now = new Date().toISOString()
    const entry = {
      id: `LR-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerPhone: payload.ownerPhone,
      ownerName: payload.ownerName,
      requestedAmount: payload.requestedAmount,
      baseCeiling: payload.baseCeiling,
      adjustedCeiling: payload.adjustedCeiling,
      requestedUseVerificationLayer: payload.requestedUseVerificationLayer,
      status: 'Pending',
      applyVerificationLayer: null,
      adminNote: '',
      reviewedBy: null,
      createdAt: now,
      reviewedAt: null,
    }

    setState((prev) => ({ ...prev, loanRequests: [entry, ...prev.loanRequests] }))
    return entry
  }, [])

  const resolveLoanRequest = useCallback((id, payload) => {
    const resolvedAt = new Date().toISOString()
    let resolvedRequest = null

    setState((prev) => {
      const nextLoanRequests = prev.loanRequests.map((item) => {
        if (item.id !== id) return item

        resolvedRequest = {
          ...item,
          status: payload.decision,
          applyVerificationLayer: payload.applyVerificationLayer,
          adminNote: payload.adminNote || '',
          reviewedBy: payload.reviewerName,
          reviewedAt: resolvedAt,
        }
        return resolvedRequest
      })

      const nextDecisionEvents = resolvedRequest
        ? [
            {
              id: `DE-${Math.floor(1000 + Math.random() * 9000)}`,
              requestId: resolvedRequest.id,
              ownerName: resolvedRequest.ownerName,
              ownerPhone: resolvedRequest.ownerPhone,
              decision: payload.decision,
              applyVerificationLayer: payload.applyVerificationLayer,
              reviewerName: payload.reviewerName,
              note: payload.adminNote || '',
              createdAt: resolvedAt,
            },
            ...prev.decisionEvents,
          ]
        : prev.decisionEvents

      return {
        ...prev,
        loanRequests: nextLoanRequests,
        decisionEvents: nextDecisionEvents,
      }
    })
  }, [])

  const getUserSubmissions = useCallback(
    (ownerPhone) => submissions.filter((item) => item.ownerPhone === ownerPhone),
    [submissions]
  )

  const getUserLoanRequests = useCallback(
    (ownerPhone) => loanRequests.filter((item) => item.ownerPhone === ownerPhone),
    [loanRequests]
  )

  const getUserVerificationLayer = useCallback(
    (ownerPhone) => {
      const mine = submissions.filter((item) => item.ownerPhone === ownerPhone)
      const approved = mine.filter((item) => item.status === 'Approved').length
      const pending = mine.filter((item) => item.status === 'Pending').length
      const rejected = mine.filter((item) => item.status === 'Rejected').length
      const trustBoost = Math.min(15, approved * 4)
      const confidenceBoost = Math.min(10, approved * 3)

      return {
        total: mine.length,
        approved,
        pending,
        rejected,
        trustBoost,
        confidenceBoost,
      }
    },
    [submissions]
  )

  const queueStats = useMemo(() => {
    const pending = submissions.filter((item) => item.status === 'Pending').length
    const approved = submissions.filter((item) => item.status === 'Approved').length
    const rejected = submissions.filter((item) => item.status === 'Rejected').length
    const pendingLoanRequests = loanRequests.filter((item) => item.status === 'Pending').length

    return {
      pending,
      approved,
      rejected,
      total: submissions.length,
      pendingLoanRequests,
    }
  }, [submissions, loanRequests])

  const value = useMemo(
    () => ({
      submissions,
      loanRequests,
      decisionEvents,
      queueStats,
      submitProof,
      reviewProof,
      submitLoanRequest,
      resolveLoanRequest,
      getUserSubmissions,
      getUserLoanRequests,
      getUserVerificationLayer,
    }),
    [
      submissions,
      loanRequests,
      decisionEvents,
      queueStats,
      submitProof,
      reviewProof,
      submitLoanRequest,
      resolveLoanRequest,
      getUserSubmissions,
      getUserLoanRequests,
      getUserVerificationLayer,
    ]
  )

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>
}

export function useVerification() {
  const ctx = useContext(VerificationContext)
  if (!ctx) throw new Error('useVerification must be used within VerificationProvider')
  return ctx
}
