import { useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { useAuth } from '../../../context/AuthContext'
import { useVerification } from '../../../context/VerificationContext'
import { StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'

function buildEvidenceArtifact(submission) {
  if (!submission) {
    return {
      id: 'EV-8842',
      user: 'Selam A.',
      type: 'M-Pesa SMS Confirmation',
      extraction: [
        { field: 'Transaction Date', raw: '2026-03-24', extracted: '2026-03-24', confidence: 99 },
        { field: 'Merchant ID', raw: 'TOTAL-HUB-X45', extracted: 'TOTAL-HUB-X45', confidence: 92 },
        { field: 'Amount Value', raw: 'Ksh 4.500', extracted: '450.00', confidence: 42 },
        { field: 'Reference ID', raw: 'QW34R5T6', extracted: 'QW34R5T6', confidence: 98 },
      ],
      rawText: 'M-PESA Confirmed. Ksh4,500.00 sent to TOTAL-HUB-X45 on 24/3/26 at 2:14 PM. Trans ID: QW34R5T6. New balance...',
    }
  }

  return {
    id: submission.id,
    user: submission.ownerName,
    type: submission.proofType,
    extraction: [
      { field: 'Document Title', raw: submission.title, extracted: submission.title, confidence: 96 },
      { field: 'Proof Type', raw: submission.proofType, extracted: submission.proofType, confidence: 93 },
      { field: 'Filename', raw: submission.fileName, extracted: submission.fileName, confidence: 88 },
      { field: 'Reviewer Notes', raw: submission.notes || 'No notes', extracted: submission.notes || 'No notes', confidence: 72 },
    ],
    rawText: `${submission.ownerName} submitted ${submission.title}. Source file: ${submission.fileName}. Notes: ${submission.notes || 'No notes provided.'}`,
  }
}

function DataReview() {
  const { user } = useAuth()
  const { recordActivity } = useAdminOps()
  const { submissions, loanRequests, decisionEvents, reviewProof, resolveLoanRequest, queueStats } = useVerification()

  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null)
  const [reviewerNote, setReviewerNote] = useState('')
  const [message, setMessage] = useState('')

  const handleCorrection = (idx, val) => {
    setReviewData((prev) => prev.map((item, i) => (i === idx ? { ...item, extracted: val } : item)))
  }

  const handleDecision = (id, status) => {
      reviewProof(id, status, user?.name || 'Admin Reviewer', reviewerNote)
      recordActivity('review', `Proof ${status.toLowerCase()}`, `Submission ${id} was ${status.toLowerCase()} in Evidence Lab.`, user?.name || 'Admin Reviewer', { submissionId: id })
      setMessage(`Submission ${id} ${status.toLowerCase()}.`)
      setReviewerNote('')
  }

  const sortedSubmissions = useMemo(() => [...submissions].sort((a, b) => {
    const order = { Pending: 0, Approved: 1, Rejected: 2 }
    const statusDiff = order[a.status] - order[b.status]
    if (statusDiff !== 0) return statusDiff
    return new Date(b.createdAt) - new Date(a.createdAt)
  }), [submissions])

  const sortedLoanRequests = useMemo(() => [...loanRequests].sort((a, b) => {
    const order = { Pending: 0, Approved: 1, Rejected: 2 }
    const statusDiff = order[a.status] - order[b.status]
    if (statusDiff !== 0) return statusDiff
    return new Date(b.createdAt) - new Date(a.createdAt)
  }), [loanRequests])

  const selectedSubmission = sortedSubmissions.find((item) => item.id === selectedSubmissionId) || sortedSubmissions[0] || null
  const activeEvidence = useMemo(() => buildEvidenceArtifact(selectedSubmission), [selectedSubmission])
  const [reviewData, setReviewData] = useState(activeEvidence.extraction)

  useEffect(() => {
    if (!selectedSubmissionId && sortedSubmissions[0]) {
      setSelectedSubmissionId(sortedSubmissions[0].id)
    }
  }, [selectedSubmissionId, sortedSubmissions])

  useEffect(() => {
    setReviewData(activeEvidence.extraction)
  }, [activeEvidence])

  const handleApprove = () => {
    recordActivity(
      'review',
      'Evidence corrections saved',
      `${activeEvidence.user} evidence extraction was updated and saved for governance review.`,
      user?.name || 'Admin Reviewer',
      { submissionId: activeEvidence.id },
    )
    setMessage(`Corrections saved for ${activeEvidence.user}.`)
  }

  const handleLoanDecision = (requestId, decision, applyVerificationLayer) => {
    resolveLoanRequest(requestId, {
      decision,
      applyVerificationLayer,
      adminNote: reviewerNote,
      reviewerName: user?.name || 'Admin Reviewer',
    })
    setMessage(`Loan request ${requestId} ${decision.toLowerCase()}.`)
    setReviewerNote('')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Review Operations</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Evidence Lab</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Split-screen verification for proof artifacts, field extraction, and optional loan layer decisions.</p>
        </div>
        <StatusBadge tone="info">Reviewer: {user?.name || 'Admin Reviewer'}</StatusBadge>
      </header>
      {message ? <p className="text-sm text-tertiary">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-5">
        <SurfaceCard className="bg-white/5 border-white/10 p-4"><p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Queue total</p><p className="mt-2 text-2xl font-bold text-white">{queueStats.total}</p></SurfaceCard>
        <SurfaceCard className="bg-yellow-400/10 border-yellow-400/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-yellow-400">Pending</p><p className="mt-2 text-2xl font-bold text-yellow-400">{queueStats.pending}</p></SurfaceCard>
        <SurfaceCard className="bg-tertiary/10 border-tertiary/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-tertiary">Approved</p><p className="mt-2 text-2xl font-bold text-tertiary">{queueStats.approved}</p></SurfaceCard>
        <SurfaceCard className="bg-error/10 border-error/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-error">Rejected</p><p className="mt-2 text-2xl font-bold text-error">{queueStats.rejected}</p></SurfaceCard>
        <SurfaceCard className="bg-primary/10 border-primary/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-primary">Pending loans</p><p className="mt-2 text-2xl font-bold text-primary">{queueStats.pendingLoanRequests}</p></SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-white">Artifact Workspace</h2>
            {selectedSubmission ? <StatusBadge tone="info">{selectedSubmission.status}</StatusBadge> : null}
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">{activeEvidence.type}</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">OCR stream</p>
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{activeEvidence.rawText}</p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Parsing confidence</p>
            {reviewData.map((item) => (
              <div key={item.field} className="rounded-lg border border-white/10 bg-surface-low/50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface">{item.field}</span>
                  <span className={item.confidence < 50 ? 'text-error' : item.confidence < 90 ? 'text-yellow-400' : 'text-tertiary'}>{item.confidence}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className={item.confidence < 50 ? 'h-full rounded-full bg-error' : item.confidence < 90 ? 'h-full rounded-full bg-yellow-400' : 'h-full rounded-full bg-tertiary'} style={{ width: `${item.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-white">Correction + Decision Panel</h2>
            <StatusBadge tone="warn">Manual review</StatusBadge>
          </div>
          <div className="mt-5 space-y-3">
            {reviewData.map((item, idx) => (
              <div key={item.field} className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{item.field}</p>
                  <span className="max-w-[45%] truncate text-right text-xs text-on-surface-variant">raw: {item.raw}</span>
                </div>
                <input
                  value={item.extracted}
                  onChange={(event) => handleCorrection(idx, event.target.value)}
                  className="mt-3 w-full rounded-lg border border-white/15 bg-surface-lowest/80 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={handleApprove} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">Save corrections</button>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="glass-surface border-white/10 p-6">
        <h2 className="font-display text-xl font-semibold text-white">Additional Proof Queue</h2>
        <div className="mt-4 grid gap-3 md:hidden">
          {sortedSubmissions.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedSubmissionId(item.id)}
              className={`rounded-2xl border p-4 text-left ${selectedSubmissionId === item.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{item.ownerName}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{item.proofType}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">{item.fileName}</p>
                </div>
                <StatusBadge tone={item.status === 'Approved' ? 'good' : item.status === 'Rejected' ? 'bad' : 'warn'}>{item.status}</StatusBadge>
              </div>
              <p className="mt-3 text-sm text-on-surface">{item.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === 'Pending' ? (
                  <>
                    <button type="button" onClick={(event) => { event.stopPropagation(); handleDecision(item.id, 'Approved') }} className="rounded-lg bg-tertiary/20 px-3 py-2 text-xs font-semibold uppercase text-tertiary">Approve</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); handleDecision(item.id, 'Rejected') }} className="rounded-lg bg-error/20 px-3 py-2 text-xs font-semibold uppercase text-error">Reject</button>
                  </>
                ) : (
                  <p className="text-xs text-on-surface-variant">Reviewed by {item.reviewedBy || 'system'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 hidden overflow-hidden rounded-xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low/60 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Submission</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-surface-low/40">
              {sortedSubmissions.map((item) => (
                <tr key={item.id} className={selectedSubmissionId === item.id ? 'bg-white/5' : ''} onClick={() => setSelectedSubmissionId(item.id)}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">{item.ownerName}</p>
                    <p className="text-xs text-on-surface-variant">{item.ownerPhone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.proofType} - {item.fileName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={item.status === 'Approved' ? 'good' : item.status === 'Rejected' ? 'bad' : 'warn'}>{item.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-4">
                    {item.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleDecision(item.id, 'Approved')} className="rounded bg-tertiary/20 px-3 py-1 text-xs font-semibold uppercase text-tertiary">Approve</button>
                        <button type="button" onClick={() => handleDecision(item.id, 'Rejected')} className="rounded bg-error/20 px-3 py-1 text-xs font-semibold uppercase text-error">Reject</button>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant">{item.reviewedBy || 'Reviewed'}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Reviewer note</span>
          <textarea
            rows={3}
            value={reviewerNote}
            onChange={(event) => setReviewerNote(event.target.value)}
            className="mt-2 w-full rounded-lg border border-white/15 bg-surface-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50"
            placeholder="Reasoning for the next review action"
          />
        </label>
      </SurfaceCard>

      <SurfaceCard className="glass-surface border-white/10 p-6">
        <h2 className="font-display text-xl font-semibold text-white">Loan Decision Workbench</h2>
        <div className="mt-4 grid gap-3 md:hidden">
          {sortedLoanRequests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-white/10 bg-surface-low/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{request.ownerName}</p>
                  <p className="mt-1 text-sm text-on-surface">${request.requestedAmount.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Base ${request.baseCeiling.toLocaleString()} • Adj ${request.adjustedCeiling.toLocaleString()}</p>
                </div>
                <StatusBadge tone={request.status === 'Approved' ? 'good' : request.status === 'Rejected' ? 'bad' : 'warn'}>{request.status}</StatusBadge>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">Preference: {request.requestedUseVerificationLayer ? 'Prefer ON' : 'Prefer OFF'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {request.status === 'Pending' ? (
                  <>
                    <button type="button" onClick={() => handleLoanDecision(request.id, 'Approved', true)} className="rounded-lg bg-primary/20 px-3 py-2 text-xs font-semibold uppercase text-primary">Approve + Layer</button>
                    <button type="button" onClick={() => handleLoanDecision(request.id, 'Approved', false)} className="rounded-lg bg-tertiary/20 px-3 py-2 text-xs font-semibold uppercase text-tertiary">Approve no layer</button>
                    <button type="button" onClick={() => handleLoanDecision(request.id, 'Rejected', false)} className="rounded-lg bg-error/20 px-3 py-2 text-xs font-semibold uppercase text-error">Reject</button>
                  </>
                ) : (
                  <p className="text-xs text-on-surface-variant">Layer used: {request.applyVerificationLayer ? 'Yes' : 'No'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 hidden overflow-hidden rounded-xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low/60 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Preference</th>
                <th className="px-4 py-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-surface-low/40">
              {sortedLoanRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">{request.ownerName}</p>
                    <p className="text-xs text-on-surface-variant">{request.ownerPhone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">${request.requestedAmount.toLocaleString()}</p>
                    <p className="text-xs text-on-surface-variant">Base ${request.baseCeiling.toLocaleString()} - Adj ${request.adjustedCeiling.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-on-surface-variant">{request.requestedUseVerificationLayer ? 'Prefer ON' : 'Prefer OFF'}</td>
                  <td className="px-4 py-4">
                    {request.status === 'Pending' ? (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleLoanDecision(request.id, 'Approved', true)} className="rounded bg-primary/20 px-3 py-1 text-xs font-semibold uppercase text-primary">Approve + Layer</button>
                        <button type="button" onClick={() => handleLoanDecision(request.id, 'Approved', false)} className="rounded bg-tertiary/20 px-3 py-1 text-xs font-semibold uppercase text-tertiary">Approve no layer</button>
                        <button type="button" onClick={() => handleLoanDecision(request.id, 'Rejected', false)} className="rounded bg-error/20 px-3 py-1 text-xs font-semibold uppercase text-error">Reject</button>
                      </div>
                    ) : (
                      <div>
                        <StatusBadge tone={request.status === 'Approved' ? 'good' : 'bad'}>{request.status}</StatusBadge>
                        <p className="mt-1 text-xs text-on-surface-variant">Layer used: {request.applyVerificationLayer ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="glass-surface border-white/10 p-6">
        <h2 className="font-display text-xl font-semibold text-white">Decision Audit Feed</h2>
        <div className="mt-4 space-y-3">
          {decisionEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-on-surface">{event.ownerName}</p>
                <StatusBadge tone={event.decision === 'Approved' ? 'good' : 'bad'}>{event.decision}</StatusBadge>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">Reviewer: {event.reviewerName}</p>
              <p className="mt-1 text-xs text-on-surface-variant">Layer: {event.applyVerificationLayer ? 'Applied' : 'Ignored'}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  )
}

export default DataReview
