import { useMemo, useState } from 'react'
import { mockTransactions, peers, userProfile } from './data/mockData'

const pages = [
  { key: 'dashboard', label: 'User Dashboard' },
  { key: 'send', label: 'Send Money' },
  { key: 'history', label: 'Transaction History' },
  { key: 'loan', label: 'Loan Request' },
  { key: 'admin', label: 'Admin Dashboard' },
]

const riskTone = {
  LOW: 'bg-secondary-container text-on-secondary-container',
  MEDIUM: 'bg-warning-container text-on-warning-container',
  HIGH: 'bg-error-container text-on-error-container',
}

const statusTone = {
  Allowed: 'bg-secondary-container text-on-secondary-container',
  Flagged: 'bg-warning-container text-on-warning-container',
  Blocked: 'bg-error-container text-on-error-container',
}

function computeTrust(score) {
  if (score >= 720) {
    return 'Low Risk'
  }
  if (score >= 610) {
    return 'Medium Risk'
  }
  return 'High Risk'
}

function evaluateTransfer(amount, currentScore) {
  if (amount > 1200 || currentScore < 590) {
    return {
      status: 'Blocked',
      riskLevel: 'HIGH',
      riskScore: 0.86,
      reason: 'Transaction pattern appears unusual for your recent activity.',
      message: 'Transfer blocked to protect your account. Please retry with a lower amount.',
    }
  }

  if (amount > 750 || currentScore < 680) {
    return {
      status: 'Flagged',
      riskLevel: 'MEDIUM',
      riskScore: 0.58,
      reason: 'Amount is slightly above your normal payment range.',
      message: 'Transfer sent and marked for additional AI monitoring.',
    }
  }

  return {
    status: 'Allowed',
    riskLevel: 'LOW',
    riskScore: 0.14,
    reason: 'Behavior is consistent with your normal transaction history.',
    message: 'Transfer approved instantly.',
  }
}

function evaluateLoan(amount, creditScore, eligibleAmount) {
  if (amount <= eligibleAmount && creditScore >= 660) {
    return {
      decision: 'Approved',
      explanation: 'Strong repayment profile and stable transaction trust score.',
      approvedAmount: amount,
    }
  }

  return {
    decision: 'Rejected',
    explanation: 'Requested amount exceeds your current trust threshold. Build consistency for higher limits.',
    approvedAmount: 0,
  }
}

function Badge({ label, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.05em] ${tone}`}>
      {label}
    </span>
  )
}

function Card({ title, subtitle, right, children }) {
  return (
    <article className="rounded-[1.5rem] bg-surface-lowest p-6 shadow-soft animate-rise">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[1.5rem] font-semibold text-on-surface">{title}</h3>
          {subtitle && <p className="mt-1 font-body text-sm text-on-surface/70">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </article>
  )
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [transactions, setTransactions] = useState(mockTransactions)
  const [balance, setBalance] = useState(userProfile.balance)
  const [creditScore, setCreditScore] = useState(userProfile.creditScore)
  const [sendForm, setSendForm] = useState({ receiver: peers[0], amount: '' })
  const [loanAmount, setLoanAmount] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoanChecking, setIsLoanChecking] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [loanDecision, setLoanDecision] = useState(null)
  const [historyFilter, setHistoryFilter] = useState('All')

  const trustLevel = computeTrust(creditScore)
  const eligibleLoanAmount = Math.max(50, Math.round((creditScore / 850) * 1500))

  const filteredTransactions = useMemo(() => {
    if (historyFilter === 'All') {
      return transactions
    }
    if (historyFilter === 'Sent') {
      return transactions.filter((item) => item.type === 'Sent')
    }
    if (historyFilter === 'Received') {
      return transactions.filter((item) => item.type === 'Received')
    }
    return transactions.filter((item) => item.status === 'Flagged' || item.status === 'Blocked')
  }, [transactions, historyFilter])

  const topStats = useMemo(() => {
    const fraudAlerts = transactions.filter((item) => item.riskLevel === 'HIGH').length
    const blocked = transactions.filter((item) => item.status === 'Blocked').length
    return {
      transactions: transactions.length,
      fraudAlerts,
      users: 284,
      blocked,
    }
  }, [transactions])

  const aiInsight = useMemo(() => {
    if (creditScore >= 720) {
      return 'Your activity is consistent. You are eligible for higher credit and faster approvals.'
    }
    if (creditScore >= 610) {
      return 'Your trust profile is stable. Keep regular transaction behavior to unlock better loan terms.'
    }
    return 'Your trust signal is currently weak. Smaller, frequent payments can improve your credit profile.'
  }, [creditScore])

  const handleTransferConfirm = () => {
    setShowConfirmModal(false)
    setIsSending(true)
    setSendResult(null)

    window.setTimeout(() => {
      const amount = Number(sendForm.amount)
      const decision = evaluateTransfer(amount, creditScore)

      const nextTransaction = {
        id: `TX-${Date.now()}`,
        name: sendForm.receiver,
        type: 'Sent',
        amount,
        time: 'Just now',
        riskLevel: decision.riskLevel,
        status: decision.status,
      }

      setTransactions((prev) => [nextTransaction, ...prev])
      if (decision.status !== 'Blocked') {
        setBalance((prev) => Number((prev - amount).toFixed(2)))
      }

      if (decision.status === 'Allowed') {
        setCreditScore((prev) => Math.min(850, prev + 4))
      } else if (decision.status === 'Blocked') {
        setCreditScore((prev) => Math.max(300, prev - 6))
      }

      setSendResult(decision)
      setIsSending(false)
      setSendForm({ receiver: peers[0], amount: '' })
    }, 1300)
  }

  const submitLoanRequest = (event) => {
    event.preventDefault()
    setIsLoanChecking(true)
    setLoanDecision(null)

    window.setTimeout(() => {
      const requested = Number(loanAmount)
      const decision = evaluateLoan(requested, creditScore, eligibleLoanAmount)
      setLoanDecision(decision)
      setIsLoanChecking(false)
    }, 1100)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,_rgba(53,37,205,0.08),_transparent_38%),radial-gradient(circle_at_85%_8%,_rgba(79,70,229,0.06),_transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-10">
        <header className="mb-8 rounded-[2rem] bg-surface-low p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="editorial-label text-primary-container">AI Financial Trust System</p>
              <h1 className="mt-1 font-display text-[2rem] font-bold text-on-surface sm:text-[2.2rem]">
                Campus Credit and Fraud Intelligence
              </h1>
              <p className="mt-3 max-w-3xl font-body text-sm leading-7 text-on-surface/70">
                Real-time fraud detection and dynamic credit scoring with transparent AI decisions.
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-surface-high px-4 py-3 font-body text-sm text-on-surface/80">
              Active user: <span className="font-semibold">{userProfile.name}</span>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {pages.map((page) => (
              <button
                key={page.key}
                onClick={() => setActivePage(page.key)}
                className={`rounded-[1.15rem] px-4 py-2 font-body text-sm font-semibold transition duration-300 ${
                  activePage === page.key
                    ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-[0_20px_50px_rgba(77,68,227,0.05)]'
                    : 'bg-surface-high text-on-surface/75 hover:scale-[1.01]'
                }`}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </header>

        {activePage === 'dashboard' && (
          <section className="grid gap-6 lg:grid-cols-5">
            <Card title="Available Balance" subtitle="Campus wallet">
              <p className="font-display text-[2.4rem] font-bold text-on-surface">${balance.toLocaleString()}</p>
              <p className="mt-2 font-body text-sm text-on-surface/70">Updated in real time</p>
            </Card>

            <Card title="Credit Score" subtitle="Dynamic trust scoring">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-[2.75rem] font-bold text-on-surface">{creditScore}</p>
                <p className="font-body text-sm font-medium text-on-surface/60">/ 850</p>
              </div>
              <div className="h-3 rounded-full bg-surface-highest">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700"
                  style={{ width: `${(creditScore / 850) * 100}%` }}
                />
              </div>
            </Card>

            <Card
              title="Trust Level"
              subtitle="Behavioral risk classification"
              right={<Badge label={trustLevel} tone={riskTone[trustLevel === 'Low Risk' ? 'LOW' : trustLevel === 'Medium Risk' ? 'MEDIUM' : 'HIGH']} />}
            >
              <p className="font-body text-sm text-on-surface/70">AI confidence: 96.2%</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setActivePage('send')}
                  className="rounded-[1.3rem] bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 font-body text-sm font-semibold text-white transition hover:scale-[1.02]"
                >
                  Send Money
                </button>
                <button
                  onClick={() => setActivePage('loan')}
                  className="rounded-[1.3rem] bg-surface-high px-4 py-2.5 font-body text-sm font-semibold text-on-surface transition hover:scale-[1.02]"
                >
                  Request Loan
                </button>
              </div>
            </Card>

            <div className="lg:col-span-3">
              <Card title="AI Insight" subtitle="Human-friendly risk and trust feedback">
                <div className="grid grid-cols-[4px_1fr] gap-4 rounded-[1.25rem] bg-surface-lowest/80 p-5 backdrop-blur-[12px]">
                  <div className="rounded-full bg-tertiary" />
                  <div>
                    <p className="font-body text-[0.95rem] leading-8 text-on-surface/85">{aiInsight}</p>
                    <button className="mt-3 font-body text-sm font-semibold text-primary-container">View Full AI Analysis</button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card title="Recent Transactions" subtitle="Card-based timeline with risk visibility">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {transactions.slice(0, 6).map((item) => (
                    <article key={item.id} className="rounded-[1.1rem] bg-surface-low p-4 transition hover:scale-[1.01]">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-body font-semibold text-on-surface">{item.name}</p>
                        <p className={`font-body text-sm font-semibold ${item.type === 'Sent' ? 'text-on-surface/70' : 'text-primary-container'}`}>
                          {item.type === 'Sent' ? '-' : '+'}${item.amount}
                        </p>
                      </div>
                      <p className="editorial-label text-on-surface/45">{item.time}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge label={item.status} tone={statusTone[item.status]} />
                        <Badge label={item.riskLevel} tone={riskTone[item.riskLevel]} />
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        )}

        {activePage === 'send' && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card title="Send Money" subtitle="Instant AI-powered transfer verification">
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setShowConfirmModal(true)
                  }}
                >
                  <label className="grid gap-2">
                    <span className="editorial-label text-on-surface/55">Receiver</span>
                    <select
                      value={sendForm.receiver}
                      onChange={(event) => setSendForm((prev) => ({ ...prev, receiver: event.target.value }))}
                      className="rounded-[1.4rem] bg-surface-low px-4 py-3 font-body text-sm outline-none ring-0 transition focus:ring-2 focus:ring-primary/30"
                    >
                      {peers.map((peer) => (
                        <option key={peer} value={peer}>
                          {peer}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="editorial-label text-on-surface/55">Amount</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={sendForm.amount}
                      onChange={(event) => setSendForm((prev) => ({ ...prev, amount: event.target.value }))}
                      placeholder="Enter amount"
                      className="rounded-[1.4rem] bg-surface-low px-4 py-3 font-body text-sm outline-none ring-0 transition focus:ring-2 focus:ring-primary/30"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!sendForm.amount || Number(sendForm.amount) <= 0}
                    className="mt-3 rounded-[1.4rem] bg-gradient-to-r from-primary to-primary-container px-4 py-3 font-body text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </form>
              </Card>
            </div>

            <Card title="Transfer Guard" subtitle="AI action feedback and explanation">
              {isSending && (
                <div className="space-y-3">
                  <div className="h-2 animate-pulse rounded-full bg-primary/20" />
                  <p className="font-body text-sm text-on-surface/70">Analyzing transfer behavior and trust profile...</p>
                </div>
              )}

              {!isSending && !sendResult && (
                <p className="font-body text-sm leading-7 text-on-surface/70">
                  Submit a transfer to see real-time fraud decisioning, risk level, and explanation.
                </p>
              )}

              {!isSending && sendResult && (
                <div className="space-y-3">
                  <Badge label={sendResult.status} tone={statusTone[sendResult.status]} />
                  <Badge label={`Risk: ${sendResult.riskLevel}`} tone={riskTone[sendResult.riskLevel]} />
                  <p className="font-body text-sm leading-7 text-on-surface">{sendResult.message}</p>
                  <p className="font-body text-sm leading-7 text-on-surface/75">Reason: {sendResult.reason}</p>
                  <p className="editorial-label text-primary-container">Risk score: {(sendResult.riskScore * 100).toFixed(0)}%</p>
                </div>
              )}
            </Card>
          </section>
        )}

        {activePage === 'history' && (
          <section>
            <Card title="Transaction History" subtitle="Filter by direction and risk behavior">
              <div className="mb-4 flex flex-wrap gap-2">
                {['All', 'Sent', 'Received', 'Flagged'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHistoryFilter(tab)}
                    className={`rounded-full px-4 py-2 font-body text-sm font-semibold transition ${
                      historyFilter === tab
                        ? 'bg-gradient-to-r from-primary to-primary-container text-white'
                        : 'bg-surface-high text-on-surface/75 hover:scale-[1.01]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredTransactions.map((item) => (
                  <article key={item.id} className="rounded-[1.2rem] bg-surface-low p-4 transition hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                      <p className="font-body font-semibold text-on-surface">{item.name}</p>
                      <span className="editorial-label text-on-surface/45">{item.type}</span>
                    </div>
                    <p className={`mt-2 font-display text-lg font-bold ${item.type === 'Sent' ? 'text-on-surface' : 'text-primary-container'}`}>
                      {item.type === 'Sent' ? '-' : '+'}${item.amount}
                    </p>
                    <p className="editorial-label text-on-surface/45">{item.time}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge label={item.status} tone={statusTone[item.status]} />
                      <Badge label={item.riskLevel} tone={riskTone[item.riskLevel]} />
                    </div>
                  </article>
                ))}
              </div>
            </Card>
          </section>
        )}

        {activePage === 'loan' && (
          <section className="grid gap-6 lg:grid-cols-5">
            <Card title="Loan Eligibility" subtitle="AI-based instant micro-loan profile">
              <p className="editorial-label text-on-surface/45">Current credit score</p>
              <p className="font-display text-[2.4rem] font-bold text-on-surface">{creditScore}</p>
              <p className="mt-5 editorial-label text-on-surface/45">Eligible amount</p>
              <p className="font-display text-2xl font-bold text-primary-container">${eligibleLoanAmount}</p>
            </Card>

            <div className="lg:col-span-4">
              <Card title="Request Loan" subtitle="Instant decision with transparent reason">
                <form onSubmit={submitLoanRequest} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="grid gap-2">
                    <span className="editorial-label text-on-surface/55">Loan amount</span>
                    <input
                      type="number"
                      min="10"
                      max={eligibleLoanAmount * 2}
                      required
                      value={loanAmount}
                      onChange={(event) => setLoanAmount(event.target.value)}
                      placeholder="Enter amount"
                      className="rounded-[1.4rem] bg-surface-low px-4 py-3 font-body text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-[1.4rem] bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:scale-[1.02]"
                  >
                    Check Decision
                  </button>
                </form>

                {isLoanChecking && (
                  <div className="mt-4 rounded-[1.2rem] bg-surface-high p-4">
                    <p className="font-body text-sm text-on-surface/75">Assessing repayment trust and behavioral confidence...</p>
                  </div>
                )}

                {!isLoanChecking && loanDecision && (
                  <div className="mt-4 rounded-[1.2rem] bg-surface-high p-4">
                    <Badge
                      label={loanDecision.decision}
                      tone={loanDecision.decision === 'Approved' ? statusTone.Allowed : statusTone.Blocked}
                    />
                    <p className="mt-3 font-body text-sm leading-7 text-on-surface/80">{loanDecision.explanation}</p>
                    {loanDecision.decision === 'Approved' && (
                      <p className="mt-2 editorial-label text-primary-container">Approved amount: ${loanDecision.approvedAmount}</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </section>
        )}

        {activePage === 'admin' && (
          <section className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card title="Total Transactions">
                <p className="font-display text-3xl font-bold text-on-surface">{topStats.transactions}</p>
              </Card>
              <Card title="Fraud Alerts">
                <p className="font-display text-3xl font-bold text-on-error-container">{topStats.fraudAlerts}</p>
              </Card>
              <Card title="Active Users">
                <p className="font-display text-3xl font-bold text-on-surface">{topStats.users}</p>
              </Card>
              <Card title="Blocked Transactions">
                <p className="font-display text-3xl font-bold text-on-warning-container">{topStats.blocked}</p>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Card title="Transactions Monitor" subtitle="Recent activity with risk level and outcome">
                  <div className="space-y-3">
                    {transactions.slice(0, 8).map((item) => (
                      <div key={item.id} className="grid items-center gap-3 rounded-[1.2rem] bg-surface-low p-4 sm:grid-cols-[1.3fr_0.7fr_0.8fr_0.8fr]">
                        <p className="font-body font-medium text-on-surface">{item.name}</p>
                        <p className="font-body text-sm text-on-surface/80">${item.amount}</p>
                        <Badge label={item.riskLevel} tone={riskTone[item.riskLevel]} />
                        <Badge label={item.status} tone={statusTone[item.status]} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card title="Fraud Alerts" subtitle="High-risk transactions requiring review">
                <div className="space-y-3">
                  {transactions
                    .filter((item) => item.riskLevel === 'HIGH')
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.id} className="rounded-[1rem] bg-error-container p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-body font-semibold text-on-error-container">{item.name}</p>
                          <p className="font-body text-sm font-semibold text-on-error-container">${item.amount}</p>
                        </div>
                        <p className="mt-1 editorial-label text-on-error-container/70">{item.time}</p>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="User Credit Scores" subtitle="Campus trust distribution">
                <div className="space-y-3">
                  {[
                    { name: userProfile.name, score: creditScore },
                    { name: 'Saron M.', score: 728 },
                    { name: 'Nahom T.', score: 612 },
                    { name: 'Meron G.', score: 575 },
                  ].map((entry) => (
                    <div key={entry.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <p className="font-body font-medium text-on-surface/80">{entry.name}</p>
                        <p className="font-body font-semibold text-on-surface">{entry.score}</p>
                      </div>
                      <div className="h-2 rounded-full bg-surface-highest">
                        <div className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${(entry.score / 850) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Feature Insights" subtitle="Top factors affecting AI risk decisions">
                <ul className="space-y-3 font-body text-sm text-on-surface/80">
                  <li className="rounded-[1rem] bg-surface-high p-3">Transaction amount variance from normal behavior</li>
                  <li className="rounded-[1rem] bg-surface-high p-3">Consistency and timing of campus payments</li>
                  <li className="rounded-[1rem] bg-surface-high p-3">Historical trust pattern in peer-to-peer transfers</li>
                </ul>
              </Card>
            </div>
          </section>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-on-surface/25 p-4">
          <div className="w-full max-w-md rounded-[1.8rem] bg-surface-lowest/90 p-6 shadow-[0_20px_50px_rgba(77,68,227,0.05)] backdrop-blur-[12px]">
            <h2 className="font-display text-xl font-semibold text-on-surface">Confirm Transfer</h2>
            <p className="mt-2 font-body text-sm text-on-surface/75">
              Send <span className="font-semibold">${sendForm.amount || 0}</span> to{' '}
              <span className="font-semibold">{sendForm.receiver}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-[1.2rem] bg-surface-high px-4 py-2 font-body text-sm font-semibold text-on-surface/85 transition hover:scale-[1.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferConfirm}
                className="flex-1 rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-container px-4 py-2 font-body text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
