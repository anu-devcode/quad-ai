import { useMemo, useState } from 'react'
import { PremiumButton, SectionHeading, SurfaceCard } from '../../components/ui'
import { userProfile } from '../../data/mockData'

function DashboardLoan() {
  const [amount, setAmount] = useState('')
  const eligible = useMemo(() => Math.round((userProfile.creditScore / 850) * 8000), [])

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
        <div className="mt-8">
          <PremiumButton className="w-full sm:w-auto">Request Eligibility Audit</PremiumButton>
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
    </div>
  )
}

export default DashboardLoan
