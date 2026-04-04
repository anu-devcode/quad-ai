import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'qued_admin_ops_v1'

const defaultPolicy = {
  riskThreshold: 65,
  confidenceThreshold: 75,
  alertSensitivity: 58,
  appliedAt: '2026-04-04T08:30:00.000Z',
}

const seedUsers = [
  { id: 'QU-8492', name: 'Selam A.', phone: '+251911222333', score: 742, status: 'Verified', role: 'Citizen', date: '2d ago', monthlyVolume: 18400, trust: 88, risk: 24 },
  { id: 'QU-1520', name: 'Abdi K.', phone: '+251911444555', score: 342, status: 'Flagged', role: 'Merchant', date: '4h ago', monthlyVolume: 9400, trust: 31, risk: 78 },
  { id: 'QU-6302', name: 'Lina M.', phone: '+251911000222', score: 512, status: 'Neutral', role: 'Agent', date: '12m ago', monthlyVolume: 12100, trust: 59, risk: 44 },
  { id: 'QU-2210', name: 'Daniel T.', phone: '+251922333111', score: 810, status: 'Verified', role: 'Citizen', date: '1w ago', monthlyVolume: 23100, trust: 94, risk: 12 },
  { id: 'QU-4091', name: 'John D.', phone: '+251900111222', score: 180, status: 'Blocked', role: 'Merchant', date: '1d ago', monthlyVolume: 4100, trust: 18, risk: 91 },
]

const seedRiskCases = [
  { id: 'FR-923', userId: 'QU-1520', user: 'Abdi K.', phone: '+251911444555', risk: 'High', type: 'Velocity Spike', date: '12m ago', score: 342, status: 'Open', cluster: 'Addis Core', channel: 'Wallet' },
  { id: 'FR-842', userId: 'QU-6302', user: 'Lina M.', phone: '+251911000222', risk: 'Medium', type: 'Metadata Mismatch', date: '2h ago', score: 512, status: 'Open', cluster: 'Agent Mesh', channel: 'Agent' },
  { id: 'FR-711', userId: 'QU-2210', user: 'Daniel T.', phone: '+251922333111', risk: 'Low', type: 'Orphan Transaction', date: '4h ago', score: 620, status: 'Open', cluster: 'Retail South', channel: 'Card' },
  { id: 'FR-650', userId: 'QU-4091', user: 'John D.', phone: '+251900111222', risk: 'High', type: 'Identity Collision', date: '1d ago', score: 180, status: 'Escalated', cluster: 'Merchant Hub', channel: 'Merchant' },
]

const seedModels = [
  { name: 'Sovereign-Alpha-v4', version: '4.2.1', signals: '2,400', depth: '98%', status: 'Stable', performance: '+2.4%', deployment: 'Active', drift: 4, lastSync: '12m ago' },
  { name: 'Neural-Inference-Engine', version: '1.09', signals: '8,400', depth: '94%', status: 'Calibrating', performance: '-0.1%', deployment: 'Shadow', drift: 9, lastSync: '26m ago' },
  { name: 'Fraud-Surveillance-Hub', version: '3.1', signals: '12,500', depth: '99%', status: 'Stable', performance: '+5.7%', deployment: 'Active', drift: 3, lastSync: '4m ago' },
]

const seedActivityLog = [
  {
    id: 'AO-1001',
    kind: 'config',
    title: 'Policy baseline synced',
    description: 'Risk, confidence, and alert thresholds were aligned to the current control-room baseline.',
    actor: 'System Admin',
    createdAt: '2026-04-04T08:35:00.000Z',
  },
]

function createId(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function createActivity(kind, title, description, actor, metadata = {}) {
  return {
    id: createId('AO'),
    kind,
    title,
    description,
    actor,
    createdAt: new Date().toISOString(),
    ...metadata,
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        policy: defaultPolicy,
        users: seedUsers,
        riskCases: seedRiskCases,
        models: seedModels,
        activityLog: seedActivityLog,
      }
    }

    const parsed = JSON.parse(raw)
    return {
      policy: parsed.policy || defaultPolicy,
      users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : seedUsers,
      riskCases: Array.isArray(parsed.riskCases) && parsed.riskCases.length ? parsed.riskCases : seedRiskCases,
      models: Array.isArray(parsed.models) && parsed.models.length ? parsed.models : seedModels,
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : seedActivityLog,
    }
  } catch {
    return {
      policy: defaultPolicy,
      users: seedUsers,
      riskCases: seedRiskCases,
      models: seedModels,
      activityLog: seedActivityLog,
    }
  }
}

function updateUserState(users, userId, updates) {
  return users.map((user) => (user.id === userId ? { ...user, ...updates } : user))
}

const AdminOpsContext = createContext(null)

export function AdminOpsProvider({ children }) {
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // no-op
    }
  }, [state])

  const recordActivity = useCallback((kind, title, description, actor, metadata = {}) => {
    const event = createActivity(kind, title, description, actor, metadata)
    setState((prev) => ({ ...prev, activityLog: [event, ...prev.activityLog].slice(0, 100) }))
    return event
  }, [])

  const applyPolicyConfig = useCallback((nextPolicy, actor) => {
    setState((prev) => ({
      ...prev,
      policy: {
        ...prev.policy,
        ...nextPolicy,
        appliedAt: new Date().toISOString(),
      },
      activityLog: [
        createActivity(
          'config',
          'Policy configuration applied',
          `Risk ${nextPolicy.riskThreshold}%, confidence ${nextPolicy.confidenceThreshold}%, alert ${nextPolicy.alertSensitivity}%.`,
          actor,
        ),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
  }, [])

  const resetPolicyConfig = useCallback((actor) => {
    setState((prev) => ({
      ...prev,
      policy: {
        ...defaultPolicy,
        appliedAt: new Date().toISOString(),
      },
      activityLog: [
        createActivity('config', 'Policy configuration reset', 'Restored default risk, confidence, and alert thresholds.', actor),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
  }, [])

  const updateRiskCaseStatus = useCallback((caseId, nextStatus, actor) => {
    setState((prev) => {
      const current = prev.riskCases.find((item) => item.id === caseId)
      if (!current) return prev

      const riskCases = prev.riskCases.map((item) =>
        item.id === caseId
          ? { ...item, status: nextStatus, date: 'just now' }
          : item,
      )

      let users = prev.users
      if (nextStatus === 'Whitelisted') {
        users = updateUserState(users, current.userId, { status: 'Verified', risk: Math.max(5, (current.score / 850) * 25) })
      } else if (nextStatus === 'Resolved') {
        users = updateUserState(users, current.userId, { status: 'Neutral' })
      } else if (nextStatus === 'Escalated') {
        users = updateUserState(users, current.userId, { status: 'Flagged' })
      }

      return {
        ...prev,
        users,
        riskCases,
        activityLog: [
          createActivity('risk', `Risk case ${nextStatus.toLowerCase()}`, `${current.user} case ${current.id} marked ${nextStatus.toLowerCase()}.`, actor, { caseId }),
          ...prev.activityLog,
        ].slice(0, 100),
      }
    })
  }, [])

  const flagUser = useCallback((userId, actor, reason = 'Behavior anomaly detected.') => {
    setState((prev) => {
      const target = prev.users.find((user) => user.id === userId)
      if (!target) return prev

      const users = updateUserState(prev.users, userId, { status: 'Flagged', date: 'just now' })
      const existingCase = prev.riskCases.find((item) => item.userId === userId && item.status !== 'Resolved' && item.status !== 'Whitelisted')
      const riskCases = existingCase
        ? prev.riskCases.map((item) =>
            item.id === existingCase.id ? { ...item, status: 'Escalated', risk: 'High', date: 'just now' } : item,
          )
        : [
            {
              id: createId('FR'),
              userId: target.id,
              user: target.name,
              phone: target.phone,
              risk: target.score < 400 ? 'High' : 'Medium',
              type: reason,
              date: 'just now',
              score: target.score,
              status: 'Open',
              cluster: 'User Intelligence',
              channel: target.role,
            },
            ...prev.riskCases,
          ]

      return {
        ...prev,
        users,
        riskCases,
        activityLog: [
          createActivity('user', 'User flagged', `${target.name} was flagged for manual review.`, actor, { userId }),
          ...prev.activityLog,
        ].slice(0, 100),
      }
    })
  }, [])

  const blockUser = useCallback((userId, actor, reason = 'Policy breach.') => {
    setState((prev) => {
      const target = prev.users.find((user) => user.id === userId)
      if (!target) return prev

      const users = updateUserState(prev.users, userId, { status: 'Blocked', date: 'just now', risk: 92, trust: 12 })
      const existingCase = prev.riskCases.find((item) => item.userId === userId)
      const riskCases = existingCase
        ? prev.riskCases.map((item) => (item.id === existingCase.id ? { ...item, status: 'Escalated', risk: 'High', type: reason, date: 'just now' } : item))
        : [
            {
              id: createId('FR'),
              userId: target.id,
              user: target.name,
              phone: target.phone,
              risk: 'High',
              type: reason,
              date: 'just now',
              score: target.score,
              status: 'Escalated',
              cluster: 'Manual Lock',
              channel: target.role,
            },
            ...prev.riskCases,
          ]

      return {
        ...prev,
        users,
        riskCases,
        activityLog: [
          createActivity('user', 'User blocked', `${target.name} was blocked from the network.`, actor, { userId }),
          ...prev.activityLog,
        ].slice(0, 100),
      }
    })
  }, [])

  const restoreUser = useCallback((userId, actor) => {
    setState((prev) => {
      const target = prev.users.find((user) => user.id === userId)
      if (!target) return prev

      const nextStatus = target.score > 700 ? 'Verified' : 'Neutral'
      const users = updateUserState(prev.users, userId, { status: nextStatus, date: 'just now', trust: Math.max(target.trust, 55), risk: Math.min(target.risk, 40) })
      const riskCases = prev.riskCases.map((item) =>
        item.userId === userId && item.status !== 'Whitelisted'
          ? { ...item, status: 'Resolved', date: 'just now' }
          : item,
      )

      return {
        ...prev,
        users,
        riskCases,
        activityLog: [
          createActivity('user', 'User restored', `${target.name} returned to ${nextStatus.toLowerCase()} state.`, actor, { userId }),
          ...prev.activityLog,
        ].slice(0, 100),
      }
    })
  }, [])

  const recalibrateModel = useCallback((modelName, actor) => {
    setState((prev) => ({
      ...prev,
      models: prev.models.map((model) =>
        model.name === modelName
          ? { ...model, status: 'Calibrating', lastSync: 'just now', drift: Math.max(1, model.drift - 1) }
          : model,
      ),
      activityLog: [
        createActivity('model', 'Model recalibration started', `${modelName} entered recalibration.`, actor, { modelName }),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
  }, [])

  const pauseModel = useCallback((modelName, actor) => {
    setState((prev) => ({
      ...prev,
      models: prev.models.map((model) =>
        model.name === modelName ? { ...model, deployment: 'Paused', status: 'Paused', lastSync: 'just now' } : model,
      ),
      activityLog: [
        createActivity('model', 'Model deployment paused', `${modelName} deployment was paused.`, actor, { modelName }),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
  }, [])

  const runCounterfactual = useCallback((actor) => {
    setState((prev) => ({
      ...prev,
      activityLog: [
        createActivity('model', 'Counterfactual simulation run', 'A reviewer ran a scenario simulation against the active decision graph.', actor),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
  }, [])

  const exportAnalytics = useCallback((format, actor) => {
    const reportId = createId('RP')
    setState((prev) => ({
      ...prev,
      activityLog: [
        createActivity('analytics', `Analytics exported as ${format.toUpperCase()}`, `Generated report ${reportId}.`, actor, { reportId, format }),
        ...prev.activityLog,
      ].slice(0, 100),
    }))
    return reportId
  }, [])

  const policy = state.policy
  const users = state.users
  const riskCases = state.riskCases
  const models = state.models
  const activityLog = state.activityLog

  const riskSummary = useMemo(() => {
    const open = riskCases.filter((item) => item.status === 'Open').length
    const escalated = riskCases.filter((item) => item.status === 'Escalated').length
    const resolved = riskCases.filter((item) => item.status === 'Resolved').length
    const whitelisted = riskCases.filter((item) => item.status === 'Whitelisted').length
    const high = riskCases.filter((item) => item.risk === 'High').length
    return { open, escalated, resolved, whitelisted, high, total: riskCases.length }
  }, [riskCases])

  const userSummary = useMemo(() => ({
    verified: users.filter((user) => user.status === 'Verified').length,
    flagged: users.filter((user) => user.status === 'Flagged').length,
    blocked: users.filter((user) => user.status === 'Blocked').length,
    total: users.length,
  }), [users])

  const modelSummary = useMemo(() => ({
    active: models.filter((model) => model.deployment === 'Active').length,
    paused: models.filter((model) => model.deployment === 'Paused').length,
    calibrating: models.filter((model) => model.status === 'Calibrating').length,
  }), [models])

  const value = useMemo(() => ({
    policy,
    users,
    riskCases,
    models,
    activityLog,
    riskSummary,
    userSummary,
    modelSummary,
    recordActivity,
    applyPolicyConfig,
    resetPolicyConfig,
    updateRiskCaseStatus,
    flagUser,
    blockUser,
    restoreUser,
    recalibrateModel,
    pauseModel,
    runCounterfactual,
    exportAnalytics,
  }), [
    policy,
    users,
    riskCases,
    models,
    activityLog,
    riskSummary,
    userSummary,
    modelSummary,
    recordActivity,
    applyPolicyConfig,
    resetPolicyConfig,
    updateRiskCaseStatus,
    flagUser,
    blockUser,
    restoreUser,
    recalibrateModel,
    pauseModel,
    runCounterfactual,
    exportAnalytics,
  ])

  return <AdminOpsContext.Provider value={value}>{children}</AdminOpsContext.Provider>
}

export function useAdminOps() {
  const context = useContext(AdminOpsContext)
  if (!context) throw new Error('useAdminOps must be used within AdminOpsProvider')
  return context
}