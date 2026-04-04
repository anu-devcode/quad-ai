import { useMemo, useState } from 'react'
import { PremiumButton, SectionHeading, SurfaceCard } from '../../components/ui'
import { userProfile } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { useVerification } from '../../context/VerificationContext'

function DashboardLoan() {
  const { user } = useAuth()
  const { submitProof, submitLoanRequest, getUserSubmissions, getUserLoanRequests, getUserVerificationLayer } = useVerification()
  const [amount, setAmount] = useState('')
  const [useVerificationLayer, setUseVerificationLayer] = useState(true)
  const [proofType, setProofType] = useState('Bank Statement')
  const [proofTitle, setProofTitle] = useState('')
  const [proofNotes, setProofNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const eligible = useMemo(() => Math.round((userProfile.creditScore / 850) * 8000), [])
  const submissions = getUserSubmissions(user?.phone || '')
  const loanRequests = getUserLoanRequests(user?.phone || '')
  const verificationLayer = getUserVerificationLayer(user?.phone || '')

  const adjustedCeiling = eligible + verificationLayer.approved * 300
  const adjustedConfidence = Math.min(99, 84 + verificationLayer.confidenceBoost)

  const requestedCeiling = useVerificationLayer ? adjustedCeiling : eligible

  const handleSubmitProof = (event) => {
    event.preventDefault()
    if (!proofTitle.trim() || !selectedFile) {
      return
    }

    submitProof({
      ownerPhone: user?.phone || 'unknown',
      ownerName: user?.name || 'Unknown User',
      proofType,
      title: proofTitle.trim(),
      notes: proofNotes.trim(),
      fileName: selectedFile.name,
    })

    setProofTitle('')
    setProofNotes('')
    setSelectedFile(null)
  }

  const handleLoanRequest = () => {
    const requestedAmount = Number(amount)
    if (!requestedAmount || requestedAmount < 100) {
      return
    }

    submitLoanRequest({
      ownerPhone: user?.phone || 'unknown',
      ownerName: user?.name || 'Unknown User',
      requestedAmount,
      baseCeiling: eligible,
      adjustedCeiling,
      requestedUseVerificationLayer: useVerificationLayer,
    })

    setAmount('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SurfaceCard level="lowest" className="lg:col-span-2">
        <SectionHeading overline="Liquidity Request" title="Institutional Credit Expansion" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-low p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Rating Score</p>
            <p className="mt-2 font-display text-4xl font-bold text-on-surface">{userProfile.creditScore}</p>
          </div>
          <div className="rounded-lg bg-surface-highest p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Available Ceiling</p>
            <p className="mt-2 font-display text-4xl font-bold text-primary">${eligible.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Optional Verification Boost</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">+${(verificationLayer.approved * 300).toLocaleString()}</p>
            <p className="mt-2 text-xs text-on-surface-variant">Applied only when admin approves additional proof.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-surface-low p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Decision Confidence</p>
            <p className="mt-2 font-display text-3xl font-bold text-on-surface">{adjustedConfidence}%</p>
            <p className="mt-2 text-xs text-on-surface-variant">Model score + behavior + optional verification layer.</p>
          </div>
        </div>

        <label className="mt-8 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Requested Allocation</span>
          <input
            type="number"
            min="100"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
          />
        </label>
        <div className="mt-6 rounded-xl border border-white/10 bg-surface-low/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Final Decision Inputs</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Base model ceiling: <span className="font-semibold text-on-surface">${eligible.toLocaleString()}</span> | Optional verification-adjusted ceiling:
            <span className="font-semibold text-primary"> ${adjustedCeiling.toLocaleString()}</span>
          </p>
          {verificationLayer.pending > 0 && (
            <p className="mt-2 text-xs text-yellow-400">{verificationLayer.pending} submission(s) are pending admin review and not yet applied.</p>
          )}
        </div>
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Optional Decision Layer</p>
              <p className="mt-1 text-xs text-on-surface-variant">Include approved additional proof in this request decision.</p>
            </div>
            <button
              type="button"
              onClick={() => setUseVerificationLayer((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                useVerificationLayer ? 'bg-primary text-white' : 'bg-white/10 text-on-surface-variant'
              }`}
            >
              {useVerificationLayer ? 'Use Verification Layer: On' : 'Use Verification Layer: Off'}
            </button>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">
            Ceiling used for request preview: <span className="font-semibold text-on-surface">${requestedCeiling.toLocaleString()}</span>
          </p>
        </div>
        <div className="mt-8">
          <PremiumButton onClick={handleLoanRequest} className="w-full sm:w-auto">Request Eligibility Audit</PremiumButton>
        </div>
      </SurfaceCard>

      <SurfaceCard level="highest" className="flex items-center border-l-2 border-secondary-container">
        <div>
          <SectionHeading overline="Compliance" title="Regulatory Buffer" />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Allocation is determined by cryptographic proof of history and <span className="font-bold text-on-surface">Sovereign Compliance</span> metrics.
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard level="default" className="lg:col-span-3">
        <SectionHeading overline="Verification Center" title="Submit Additional Proof (Optional)" />

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleSubmitProof} className="space-y-4 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Proof Type</span>
                <select
                  value={proofType}
                  onChange={(event) => setProofType(event.target.value)}
                  className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-primary/40"
                >
                  <option>Bank Statement</option>
                  <option>Payroll Record</option>
                  <option>Tax Receipt</option>
                  <option>Merchant Invoice</option>
                  <option>Other Financial Evidence</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">File</span>
                <input
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-xs outline-none transition file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Title</span>
              <input
                value={proofTitle}
                onChange={(event) => setProofTitle(event.target.value)}
                placeholder="e.g. March Commercial Bank statement"
                className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Notes to Reviewer</span>
              <textarea
                value={proofNotes}
                onChange={(event) => setProofNotes(event.target.value)}
                rows={4}
                placeholder="Add context for admin verification."
                className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm outline-none transition focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <PremiumButton type="submit" className="w-full sm:w-auto">
              Submit Additional Proof
            </PremiumButton>
          </form>

          <div className="rounded-xl border border-white/10 bg-surface-low/70 p-5 lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Layer Summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-on-surface">Approved: <span className="font-semibold text-tertiary">{verificationLayer.approved}</span></p>
              <p className="text-on-surface">Pending: <span className="font-semibold text-yellow-400">{verificationLayer.pending}</span></p>
              <p className="text-on-surface">Rejected: <span className="font-semibold text-error">{verificationLayer.rejected}</span></p>
              <p className="text-on-surface">Trust boost: <span className="font-semibold text-primary">+{verificationLayer.trustBoost}%</span></p>
            </div>
            <p className="mt-5 text-xs text-on-surface-variant">
              This layer is optional and never overrides core model controls; it only adds human-reviewed trust evidence.
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-surface-high/60 text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Submission</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reviewer Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-surface-low/40 text-sm">
              {submissions.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-on-surface-variant" colSpan={4}>
                    No additional proof submitted yet.
                  </td>
                </tr>
              )}
              {submissions.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.fileName}</p>
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">{item.proofType}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        item.status === 'Approved'
                          ? 'bg-tertiary/15 text-tertiary'
                          : item.status === 'Rejected'
                          ? 'bg-error/15 text-error'
                          : 'bg-yellow-400/15 text-yellow-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-on-surface-variant">
                    {item.reviewerNote || 'Waiting for admin review'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-surface-high/60 text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Loan Request</th>
                <th className="px-4 py-3">Requested Layer</th>
                <th className="px-4 py-3">Admin Decision</th>
                <th className="px-4 py-3">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-surface-low/40 text-sm">
              {loanRequests.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-on-surface-variant" colSpan={4}>
                    No loan eligibility requests submitted yet.
                  </td>
                </tr>
              )}
              {loanRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-on-surface">${request.requestedAmount.toLocaleString()}</p>
                    <p className="text-xs text-on-surface-variant">{request.id}</p>
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">
                    {request.requestedUseVerificationLayer ? 'Requested ON' : 'Requested OFF'}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        request.status === 'Approved'
                          ? 'bg-tertiary/15 text-tertiary'
                          : request.status === 'Rejected'
                          ? 'bg-error/15 text-error'
                          : 'bg-yellow-400/15 text-yellow-400'
                      }`}
                    >
                      {request.status}
                    </span>
                    {request.status !== 'Pending' && (
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Layer applied: {request.applyVerificationLayer ? 'Yes' : 'No'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-on-surface-variant">
                    {request.adminNote || 'Awaiting admin decision'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  )
}

export default DashboardLoan
