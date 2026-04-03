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
