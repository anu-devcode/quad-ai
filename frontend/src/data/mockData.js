export const landingHighlights = [
  {
    title: 'AI Credit Intelligence',
    text: 'Transparent trust scoring with a live reasoning layer for every decision.',
  },
  {
    title: 'Instant Fraud Guard',
    text: 'Anomaly monitoring reviews behavior in real time before value leaves the account.',
  },
  {
    title: 'Governed Admin Ops',
    text: 'Analysts can act on flagged accounts from a single dashboard with auditable actions.',
  },
]

export const userProfile = {
  id: 'USR-1001',
  name: 'Arielle M.',
  role: 'Premium Member',
  balance: 1240.5,
  monthlyGain: 2.4,
  creditScore: 785,
}

export const userTransactions = [
  {
    id: 'UTX-9021',
    merchant: 'Apple Store',
    category: 'Subscription',
    amount: -14.99,
    age: '2h ago',
    status: 'Completed',
  },
  {
    id: 'UTX-9020',
    merchant: 'Salary Deposit',
    category: 'Income',
    amount: 4200,
    age: '1d ago',
    status: 'Completed',
  },
  {
    id: 'UTX-9019',
    merchant: 'Utility Corp',
    category: 'Bill',
    amount: -142.3,
    age: '2d ago',
    status: 'Pending',
  },
]

export const adminStats = [
  { label: 'Transactions Today', value: '42,814', change: '+6.2%' },
  { label: 'Fraud Alerts', value: '163', change: '-12.0%' },
  { label: 'Approval Rate', value: '94.3%', change: '+1.7%' },
  { label: 'Active Analysts', value: '29', change: '+3' },
]

export const flaggedUsers = [
  { id: 'AC-5521', name: 'Jordan P.', reason: 'Velocity spike', risk: 'High', action: 'Review' },
  { id: 'AC-5516', name: 'Nia T.', reason: 'Device mismatch', risk: 'Medium', action: 'Step-up auth' },
  { id: 'AC-5508', name: 'Leo A.', reason: 'New beneficiary cluster', risk: 'High', action: 'Temporarily hold' },
  { id: 'AC-5501', name: 'Sarah Q.', reason: 'Recurring geo-switch', risk: 'Low', action: 'Monitor' },
]

export const decisionFeed = [
  {
    id: 'DEC-1028',
    event: 'Loan request approved',
    actor: 'Policy Engine',
    timestamp: '12:04 PM',
  },
  {
    id: 'DEC-1027',
    event: 'Transfer blocked due to anomaly',
    actor: 'Fraud Model v4.2',
    timestamp: '11:59 AM',
  },
  {
    id: 'DEC-1026',
    event: 'User risk downgraded to medium',
    actor: 'Analyst Nora',
    timestamp: '11:43 AM',
  },
]

export const readinessChecks = [
  {
    name: 'django_backend_structure',
    status: 'ready',
    required: true,
    detail: 'Models, views, urls, and settings are present.'
  },
  {
    name: 'fastapi_predict_service',
    status: 'ready',
    required: true,
    detail: 'POST /predict is available in src/api.py.'
  },
  {
    name: 'ocr_pipeline',
    status: 'ready',
    required: true,
    detail: 'Image preprocessing and Tesseract OCR are wired.'
  },
  {
    name: 'parser_and_validation_layer',
    status: 'ready',
    required: true,
    detail: 'Parsing score, validation logs, and source confidence are available.'
  },
]

export const dashboardStats = [
  { label: 'Total Transactions', value: '42,814', delta: '+6.2%' },
  { label: 'Flagged Count', value: '163', delta: '-12.0%' },
  { label: 'Approval Rate', value: '94.3%', delta: '+1.7%' },
  { label: 'Active Analysts', value: '29', delta: '+3' },
]

export const riskDistribution = [
  { label: 'Low', value: 72, tone: 'good' },
  { label: 'Medium', value: 18, tone: 'warn' },
  { label: 'High', value: 10, tone: 'bad' },
]

export const intakeSources = [
  {
    key: 'manual',
    label: 'Manual',
    hint: 'amount + purchase_time + device_id + ip_address',
    fields: ['amount', 'purchase_time', 'device_id', 'ip_address']
  },
  {
    key: 'sms',
    label: 'SMS',
    hint: 'raw_text + user context',
    fields: ['raw_text', 'device_id', 'ip_address']
  },
  {
    key: 'screenshot',
    label: 'Screenshot',
    hint: 'file upload + OCR confidence',
    fields: ['file', 'device_id', 'ip_address']
  },
  {
    key: 'pdf',
    label: 'PDF',
    hint: 'statement upload + OCR extraction',
    fields: ['file', 'device_id', 'ip_address']
  },
]

export const transactionExplorerRows = [
  {
    id: 'TX-20491',
    user: 'Arielle M.',
    source: 'sms',
    amount: '420.00',
    status: 'completed',
    risk: 'Low',
    confidence: '0.96',
    time: '11:42 AM'
  },
  {
    id: 'TX-20492',
    user: 'Jordan P.',
    source: 'screenshot',
    amount: '980.00',
    status: 'flagged',
    risk: 'High',
    confidence: '0.41',
    time: '11:36 AM'
  },
  {
    id: 'TX-20493',
    user: 'Nia T.',
    source: 'manual',
    amount: '75.00',
    status: 'pending',
    risk: 'Medium',
    confidence: '0.73',
    time: '11:18 AM'
  },
  {
    id: 'TX-20494',
    user: 'Leo A.',
    source: 'pdf',
    amount: '2,300.00',
    status: 'completed',
    risk: 'Medium',
    confidence: '0.84',
    time: '10:54 AM'
  },
]

export const transactionCase = {
  id: 'TX-20492',
  user: 'Jordan P.',
  amount: '980.00',
  deviceId: 'edge-device-77',
  ipAddress: '192.168.1.42',
  source: 'screenshot',
  status: 'flagged',
  riskLevel: 'High',
  fraudProbability: '0.81',
  legitimateProbability: '0.19',
  parsingSuccess: '0.43',
  sourceConfidence: '0.65',
  validationScore: '0.61',
  reasoning: [
    'Purchase occurred within 18 minutes of signup.',
    'Amount is 4x the user average purchase value.',
    'OCR confidence is below the screenshot threshold.'
  ],
  validationLogs: [
    { check: 'timestamp', result: 'passed', note: 'purchase_time is valid and later than signup_time' },
    { check: 'amount', result: 'passed', note: 'parsed amount matches extracted total' },
    { check: 'parsing', result: 'warn', note: 'source confidence is medium and parsing success is incomplete' }
  ]
}

export const loanQueue = [
  {
    id: 'LN-1004',
    user: 'Arielle M.',
    amount: '5,000',
    tenure: '12 mo',
    income: '1,800',
    status: 'evaluated',
    risk: 'Low',
    score: '0.21'
  },
  {
    id: 'LN-1005',
    user: 'Jordan P.',
    amount: '2,500',
    tenure: '6 mo',
    income: '900',
    status: 'submitted',
    risk: 'Medium',
    score: '0.58'
  },
  {
    id: 'LN-1006',
    user: 'Nia T.',
    amount: '7,500',
    tenure: '18 mo',
    income: '2,100',
    status: 'approved',
    risk: 'Low',
    score: '0.17'
  },
]
