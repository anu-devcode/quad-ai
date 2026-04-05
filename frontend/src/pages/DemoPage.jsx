import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppIcon from '../components/AppIcon'
import { PremiumButton, SurfaceCard, TokenPill } from '../components/ui'
import { getVerificationReport, uploadTransactionEvidence } from '../services/campusApi'

const DEMO_REQUEST_LIMIT = 2
const DEMO_COUNTER_STORAGE_KEY = 'quirass_demo_request_count_v1'
const DEMO_EXTERNAL_USER_KEY = 'demo-public-user'
const DEMO_OWNER_NAME = 'Public Demo User'

const sampleUploads = [
   {
      id: 'sms-confirmation',
      name: 'M-Pesa SMS Confirmation',
      type: 'SMS',
      request: {
         source_type: 'sms',
         raw_text:
            'CBE ALERT: Purchase value: 3250.75 ETB on 2026-04-05 10:30:00. Payment sent to MERCHANT-001. user_id=111 device_id=sms-device-01 ip_address=127.0.0.1',
      },
      merchantLabel: 'Safaricom Store',
      insights: ['Consistent essential spending', 'Verified mobile wallet history', 'Low churn probability'],
   },
   {
      id: 'bank-screenshot',
      name: 'Bank Transaction Screenshot',
      type: 'Screenshot',
      request: {
         source_type: 'manual',
         amount: '85000.00',
         purchase_time: '2026-03-02T09:45:00Z',
      },
      merchantLabel: 'Unity Housing',
      insights: ['Potential month-end liquidity stress', 'Recurring high-value outgoing', 'Average data signal strength'],
   },
   {
      id: 'altered-evidence',
      name: 'Suspicious / Altered Evidence',
      type: 'Screenshot',
      request: {
         source_type: 'manual',
         amount: '10000.00',
         purchase_time: '2026-02-28T13:20:00Z',
      },
      merchantLabel: 'Unknown Receiver',
      insights: ['Metadata mismatch detected', 'Inconsistent source confidence profile', 'Possible synthetic identity signal'],
   },
]

function readRequestCount() {
   try {
      const raw = window.localStorage.getItem(DEMO_COUNTER_STORAGE_KEY)
      const parsed = Number(raw)
      if (!Number.isFinite(parsed) || parsed < 0) return 0
      return Math.floor(parsed)
   } catch {
      return 0
   }
}

function writeRequestCount(nextValue) {
   try {
      window.localStorage.setItem(DEMO_COUNTER_STORAGE_KEY, String(nextValue))
   } catch {
      // Ignore persistence failures in private mode.
   }
}

function normalizeRiskLevel(value) {
   const text = String(value || '').trim().toLowerCase()
   if (!text) return 'Unknown'
   return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatTimestamp(value) {
   if (!value) return 'N/A'
   const parsed = new Date(value)
   if (Number.isNaN(parsed.getTime())) return String(value)
   return parsed.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   })
}

function formatAmount(value) {
   const numeric = Number(value)
   if (!Number.isFinite(numeric)) return String(value || 'N/A')
   return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
   }).format(numeric)
}

function mapResponseToDemoResult(responsePayload, sample, rawTextFallback = '') {
   const rawResult = responsePayload?.raw_result || responsePayload?.execution?.result || responsePayload || {}
   const parsedData = responsePayload?.parsed_data || {}
   const assessment = rawResult?.fraud_assessment || {}

   const fraudProbability = Number(
      assessment?.fraud_probability ?? responsePayload?.fraud_score ?? rawResult?.fraud_score ?? 0,
   )
   const safeProbability = Number.isFinite(fraudProbability)
      ? Math.min(1, Math.max(0, fraudProbability))
      : 0

   const risk = normalizeRiskLevel(
      assessment?.risk_level
         ?? responsePayload?.risk_level
         ?? rawResult?.trust_metrics?.risk_level,
   )
   const derivedScore = Math.max(300, Math.round((1 - safeProbability) * 850))
   const confidence = `${Math.round((1 - safeProbability) * 100)}%`

   const flags = Array.isArray(assessment?.flags) ? assessment.flags : []
   const insights = flags.length
      ? flags.slice(0, 3).map((flag) => String(flag).replace(/_/g, ' '))
      : sample.insights

   return {
      name: sample.name,
      score: derivedScore,
      risk,
      confidence,
      rawText: parsedData?.raw_text || rawTextFallback || 'No raw source text was returned for this request.',
      insights,
      data: [
         {
            date: formatTimestamp(parsedData?.purchase_time || rawResult?.purchase_time),
            merchant: sample.merchantLabel,
            amount: formatAmount(parsedData?.amount ?? rawResult?.amount),
            status: String(parsedData?.status || rawResult?.status || 'Processed'),
         },
      ],
   }
}

function DemoPage() {
   const navigate = useNavigate()

   const [isProcessing, setIsProcessing] = useState(false)
   const [result, setResult] = useState(null)
   const [showRaw, setShowRaw] = useState(false)
   const [requestCount, setRequestCount] = useState(() => readRequestCount())
   const [requestError, setRequestError] = useState('')
   const [systemStatus, setSystemStatus] = useState({
      loading: true,
      aiReady: false,
      ocrReady: false,
      detail: 'Checking backend services...',
   })

   const remainingRequests = useMemo(
      () => Math.max(0, DEMO_REQUEST_LIMIT - requestCount),
      [requestCount],
   )

   useEffect(() => {
      let active = true

      async function loadVerification() {
         try {
            const report = await getVerificationReport()
            if (!active) return

            const summary = report?.summary || {}
            const requiredMissing = Number(summary?.required_missing || 0)
            const entries = Array.isArray(report?.present) ? report.present : []
            const ocrEntry = entries.find((item) => item?.name === 'ocr_pipeline')

            setSystemStatus({
               loading: false,
               aiReady: requiredMissing === 0,
               ocrReady: Boolean(ocrEntry?.present),
               detail: requiredMissing === 0
                  ? 'Backend connectivity verified and operational.'
                  : `${requiredMissing} required check(s) missing in backend verification.`,
            })
         } catch (error) {
            if (!active) return
            setSystemStatus({
               loading: false,
               aiReady: false,
               ocrReady: false,
               detail: error?.message || 'Unable to reach backend verification endpoint.',
            })
         }
      }

      loadVerification()
      return () => {
         active = false
      }
   }, [])

   const goToPricing = () => {
      navigate('/pricing', {
         state: {
            source: 'demo-request-cap',
            usedRequests: requestCount,
         },
      })
   }

   const consumeRequestAllowance = () => {
      if (requestCount >= DEMO_REQUEST_LIMIT) {
         goToPricing()
         return false
      }

      const next = requestCount + 1
      setRequestCount(next)
      writeRequestCount(next)
      return true
   }

   const runBackendAnalysis = async (sample, payload, rawTextFallback = '') => {
      if (isProcessing) return
      if (!consumeRequestAllowance()) return

      setRequestError('')
      setResult(null)
      setShowRaw(false)
      setIsProcessing(true)

      try {
         const apiResponse = await uploadTransactionEvidence(payload)
         setResult(mapResponseToDemoResult(apiResponse, sample, rawTextFallback))
      } catch (error) {
         setRequestError(error?.message || 'Analysis failed. Please try another sample.')
      } finally {
         setIsProcessing(false)
      }
   }

   const handleSampleClick = (sample) => {
      const payload = {
         ...sample.request,
         type: sample.request?.source_type,
         device_id: `demo-${sample.id}-${Date.now()}`,
         ip_address: '127.0.0.1',
         external_user_key: DEMO_EXTERNAL_USER_KEY,
         owner_name: DEMO_OWNER_NAME,
         age: 24,
         continue_on_gaps: true,
      }

      runBackendAnalysis(sample, payload, sample.request?.raw_text || '')
   }

   const handleFileUpload = (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      const lower = file.name.toLowerCase()
      const sourceType = lower.endsWith('.pdf') ? 'pdf' : 'screenshot'
      const sampleMeta = {
         id: 'uploaded-file',
         name: `Uploaded ${sourceType === 'pdf' ? 'PDF' : 'Screenshot'} Evidence`,
         type: sourceType === 'pdf' ? 'PDF' : 'Screenshot',
         merchantLabel: 'Uploaded Evidence',
         insights: ['Evidence parsed from uploaded file', 'Trust metrics generated from backend scoring', 'Model recommendation is shown below'],
      }

      const form = new FormData()
      form.append('file', file)
      form.append('source_type', sourceType)
      form.append('type', sourceType)
      form.append('device_id', `demo-upload-${Date.now()}`)
      form.append('ip_address', '127.0.0.1')
      form.append('external_user_key', DEMO_EXTERNAL_USER_KEY)
      form.append('owner_name', DEMO_OWNER_NAME)
      form.append('age', '24')
      form.append('continue_on_gaps', 'true')

      runBackendAnalysis(sampleMeta, form)
      event.target.value = ''
   }

   const getRiskStyles = (risk) => {
      if (risk === 'Low') return 'border-tertiary/35 bg-tertiary/10 text-tertiary'
      if (risk === 'Medium') return 'border-warning/35 bg-warning/10 text-warning'
      if (risk === 'High') return 'border-error/35 bg-error/10 text-error'
      return 'border-outline-variant bg-surface-high text-on-surface-variant'
   }

   return (
      <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-12 text-on-surface sm:px-8 sm:pt-20 lg:px-12">
         <div className="pointer-events-none absolute left-1/4 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

         <main className="relative z-10 mx-auto max-w-7xl">
            <header className="mb-12 text-center">
               <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
                  <span className="section-kicker">Live Backend Demo</span>
                  <TokenPill tone={remainingRequests > 0 ? 'info' : 'warn'}>
                     {remainingRequests} request{remainingRequests === 1 ? '' : 's'} left
                  </TokenPill>
               </div>
               <h1 className="landing-title mb-4 font-display text-4xl font-extrabold sm:text-6xl">
                  Evidence <span className="text-gradient">Sandbox</span>
               </h1>
               <p className="body-muted mx-auto max-w-2xl text-lg">
                  Run up to two live backend analyses, then continue in a paid plan to unlock unlimited processing and enterprise-grade controls.
               </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-12">
               <div className="space-y-8 lg:col-span-5">
                  <SurfaceCard className="glass-surface border-outline-variant p-8">
                     <div className="mb-6 flex items-center justify-between gap-3">
                        <h3 className="font-display text-xl font-bold text-on-surface">1. Input Evidence</h3>
                        <span className="rounded-full border border-outline-variant bg-surface-high px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                           Trial cap: {DEMO_REQUEST_LIMIT}
                        </span>
                     </div>

                     <label className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest/60 p-8 text-center transition-all hover:border-primary/40 hover:bg-primary/5">
                        <input
                           type="file"
                           className="hidden"
                           onChange={handleFileUpload}
                           disabled={isProcessing || remainingRequests === 0}
                        />
                                    <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 transition-transform group-hover:rotate-6 group-hover:scale-110">
                                       <AppIcon name="attachment" className="h-7 w-7" />
                                    </div>
                        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-on-surface">Upload Evidence</p>
                        <p className="text-[10px] text-on-surface-variant">Drop screenshots or PDFs for live parser + scoring</p>
                        <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                     </label>

                     <div className="mt-8">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
                           Or use sample scenarios:
                        </p>
                        <div className="space-y-3">
                           {sampleUploads.map((sample) => (
                              <button
                                 key={sample.id}
                                 type="button"
                                 onClick={() => handleSampleClick(sample)}
                                 disabled={isProcessing || remainingRequests === 0}
                                 className="group flex w-full items-center justify-between rounded-xl border border-outline-variant bg-surface-high/60 p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-55"
                              >
                                 <div>
                                    <p className="text-sm font-bold text-on-surface transition-colors group-hover:text-primary">{sample.name}</p>
                                    <p className="text-[10px] text-on-surface-variant">{sample.type}</p>
                                 </div>
                                 <span className="text-xs text-on-surface-variant/70 transition-all group-hover:text-primary">Run</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     {remainingRequests === 0 && (
                        <div className="mt-6 rounded-xl border border-warning/35 bg-warning/10 p-4 text-sm text-on-surface">
                           <p className="font-semibold">Trial limit reached.</p>
                           <p className="mt-1 text-on-surface-variant">Upgrade to continue running live analyses and access full decisioning workflows.</p>
                           <Link
                              to="/pricing"
                              className="mt-4 inline-flex items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary"
                           >
                              View pricing
                           </Link>
                        </div>
                     )}
                  </SurfaceCard>

                  <SurfaceCard className="glass-surface border-outline-variant p-8">
                     <h4 className="mb-4 text-sm font-bold text-on-surface">System Integrity Status</h4>
                     <div className="mb-4 flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">AI Inference Layer</span>
                        <span className={systemStatus.loading ? 'text-on-surface-variant' : systemStatus.aiReady ? 'text-tertiary' : 'text-error'}>
                           {systemStatus.loading ? 'Checking...' : systemStatus.aiReady ? 'Operational' : 'Attention needed'}
                        </span>
                     </div>
                     <div className="mb-4 flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">OCR Parsing Engine</span>
                        <span className={systemStatus.loading ? 'text-on-surface-variant' : systemStatus.ocrReady ? 'text-tertiary' : 'text-error'}>
                           {systemStatus.loading ? 'Checking...' : systemStatus.ocrReady ? 'Operational' : 'Unavailable'}
                        </span>
                     </div>
                     <p className="text-xs text-on-surface-variant">{systemStatus.detail}</p>
                  </SurfaceCard>
               </div>

               <div className="lg:col-span-7">
                  <SurfaceCard className="glass-surface relative flex min-h-[640px] flex-col overflow-hidden border-outline-variant">
                     {isProcessing && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/75 p-12 text-center backdrop-blur-lg">
                           <div className="relative mb-8">
                              <div className="h-20 w-20 animate-spin rounded-2xl border border-primary/40 bg-primary/20" />
                              <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">AI</div>
                           </div>
                           <h4 className="mb-3 font-display text-2xl font-bold text-on-surface">Analyzing with backend models...</h4>
                           <p className="max-w-xs text-sm text-on-surface-variant">Parsing transaction evidence, evaluating trust metrics, and generating model risk output.</p>
                        </div>
                     )}

                     {!isProcessing && !result && (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center opacity-70">
                           <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
                              <AppIcon name="search" className="h-8 w-8" />
                           </div>
                           <h4 className="mb-3 text-xl font-bold text-on-surface">No Analysis Yet</h4>
                           <p className="max-w-sm text-sm text-on-surface-variant">Select one sample or upload one document to run a real backend evaluation.</p>
                        </div>
                     )}

                     {!isProcessing && requestError && (
                        <div className="m-8 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                           {requestError}
                        </div>
                     )}

                     {!isProcessing && result && (
                        <div className="flex-1 animate-enter overflow-y-auto p-8">
                           <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
                              <div>
                                 <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Analysis complete</p>
                                 <h3 className="font-display text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">{result.name}</h3>
                              </div>
                              <div className={`rounded-xl border px-4 py-3 ${getRiskStyles(result.risk)}`}>
                                 <p className="mb-1 text-[10px] font-bold uppercase tracking-widest">Risk Level</p>
                                 <p className="text-2xl font-black">{result.risk}</p>
                              </div>
                           </div>

                           <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
                              <div className="rounded-xl border border-outline-variant bg-surface-high/60 p-4">
                                 <p className="mb-1 text-[10px] uppercase text-on-surface-variant">Trust Score</p>
                                 <p className="text-3xl font-bold text-on-surface">{result.score}</p>
                              </div>
                              <div className="rounded-xl border border-outline-variant bg-surface-high/60 p-4">
                                 <p className="mb-1 text-[10px] uppercase text-on-surface-variant">Data Confidence</p>
                                 <p className="text-3xl font-bold text-on-surface">{result.confidence}</p>
                              </div>
                              <div className="rounded-xl border border-outline-variant bg-surface-high/60 p-4">
                                 <p className="mb-1 text-[10px] uppercase text-on-surface-variant">Data Integrity</p>
                                 <p className="text-3xl font-bold text-on-surface">Valid</p>
                              </div>
                           </div>

                           <div className="mb-10">
                              <h4 className="mb-4 text-sm font-bold text-on-surface">Parsed Transactions</h4>
                              <div className="overflow-hidden rounded-xl border border-outline-variant">
                                 <table className="w-full text-left">
                                    <thead className="bg-surface-high/60 text-[10px] uppercase tracking-widest text-on-surface-variant">
                                       <tr>
                                          <th className="px-4 py-4">Date</th>
                                          <th className="px-4 py-4">Merchant</th>
                                          <th className="px-4 py-4">Amount</th>
                                          <th className="px-4 py-4">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant bg-surface-container">
                                       {result.data.map((row, index) => (
                                          <tr key={`${row.merchant}-${index}`} className="text-xs">
                                             <td className="px-4 py-4 text-on-surface-variant">{row.date}</td>
                                             <td className="px-4 py-4 font-semibold text-on-surface">{row.merchant}</td>
                                             <td className="px-4 py-4 font-semibold text-primary">{row.amount}</td>
                                             <td className="px-4 py-4">
                                                <span className="rounded border border-outline-variant bg-surface-high px-2 py-1 text-on-surface-variant">
                                                   {row.status}
                                                </span>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           <div className="mb-10">
                              <h4 className="mb-4 text-sm font-bold text-on-surface">AI Behavioral Insights</h4>
                              <div className="grid gap-3">
                                 {result.insights.map((insight, index) => (
                                    <div key={`${insight}-${index}`} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-3 text-xs text-on-surface-variant">
                                       <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                       {insight}
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="mt-auto border-t border-outline-variant pt-8">
                              <div className="mb-4 flex items-center justify-between">
                                 <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">System Transparency</h4>
                                 <button
                                    type="button"
                                    onClick={() => setShowRaw((prev) => !prev)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                                 >
                                    {showRaw ? 'Hide Raw Text' : 'Show Raw Source'}
                                 </button>
                              </div>
                              {showRaw && (
                                 <div className="overflow-x-auto whitespace-pre rounded-xl border border-outline-variant bg-surface-container-lowest p-4 font-mono text-[10px] text-on-surface-variant">
                                    {result.rawText}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </SurfaceCard>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container p-4">
                     <p className="text-xs text-on-surface-variant">
                        Demo usage: <span className="font-semibold text-on-surface">{requestCount}</span> / {DEMO_REQUEST_LIMIT} live requests used.
                     </p>
                     <PremiumButton type="button" variant="secondary" onClick={goToPricing} className="px-4 py-2">
                        View Pricing
                     </PremiumButton>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}

export default DemoPage
