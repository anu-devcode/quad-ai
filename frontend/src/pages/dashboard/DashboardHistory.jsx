import { SectionHeading, SurfaceCard, TokenPill } from '../../components/ui'
import { userTransactions } from '../../data/mockData'

function txPill(status) {
  if (status === 'Completed') return 'good'
  if (status === 'Pending') return 'warn'
  return 'neutral'
}

function amountText(amount) {
  const sign = amount > 0 ? '+' : '-'
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DashboardHistory() {
  return (
    <SurfaceCard level="default">
      <SectionHeading overline="Complete Ledger" title="Transaction Integrity Log" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {userTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 rounded-lg bg-surface-low/50 p-4 transition-all hover:bg-surface-low"
          >
            <div className="grid h-10 w-10 place-items-center rounded bg-surface-lowest text-[10px] font-bold text-on-surface-variant">
              TX
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">{tx.merchant}</p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{tx.category} • {tx.age}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-primary' : 'text-on-surface'}`}>
                {amountText(tx.amount)}
              </p>
              <div className="mt-1">
                <TokenPill tone={txPill(tx.status)}>{tx.status}</TokenPill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
}

export default DashboardHistory
