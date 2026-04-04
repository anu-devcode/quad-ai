import { useState } from 'react'
import { PremiumButton, SectionHeading, SurfaceCard } from '../../components/ui'

function DashboardSend() {
  const [receiver, setReceiver] = useState('Sam A.')
  const [amount, setAmount] = useState('')
  const canSend = Number(amount) > 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SurfaceCard level="lowest" className="lg:col-span-2">
        <SectionHeading overline="Asset Transfer" title="Secure Dispatch" />
        <form className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Recipient Unit</span>
            <input
              value={receiver}
              onChange={(event) => setReceiver(event.target.value)}
              className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Asset Quantity</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
            />
          </label>
        </form>
        <div className="mt-8">
          <PremiumButton
            disabled={!canSend}
            className="w-full sm:w-auto"
          >
            Authorize Transfer
          </PremiumButton>
        </div>
      </SurfaceCard>

      <SurfaceCard level="highest" className="flex items-center border-l-2 border-primary/20">
        <div>
          <SectionHeading overline="Verification" title="Institutional Audit" />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Every transaction undergoes rigorous <span className="font-bold text-on-surface">behavioral trust analysis</span> and anomaly detection before protocol approval.
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}

export default DashboardSend
