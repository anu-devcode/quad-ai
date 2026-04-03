export const userProfile = {
  id: 'USR-1001',
  name: 'Abel K.',
  balance: 1240.35,
  creditScore: 694,
}

export const peers = ['Samrawit A.', 'Dawit B.', 'Ruth C.', 'Henok D.', 'Meklit E.']

export const mockTransactions = [
  {
    id: 'TX-22014',
    name: 'Samrawit A.',
    type: 'Sent',
    amount: 45,
    time: 'Today, 9:22 AM',
    riskLevel: 'LOW',
    status: 'Allowed',
  },
  {
    id: 'TX-22013',
    name: 'Campus Cafeteria',
    type: 'Sent',
    amount: 21,
    time: 'Today, 8:10 AM',
    riskLevel: 'LOW',
    status: 'Allowed',
  },
  {
    id: 'TX-22012',
    name: 'Ruth C.',
    type: 'Received',
    amount: 60,
    time: 'Yesterday, 4:12 PM',
    riskLevel: 'LOW',
    status: 'Allowed',
  },
  {
    id: 'TX-22011',
    name: 'Unknown Receiver',
    type: 'Sent',
    amount: 970,
    time: 'Yesterday, 1:35 PM',
    riskLevel: 'MEDIUM',
    status: 'Flagged',
  },
  {
    id: 'TX-22010',
    name: 'External Merchant',
    type: 'Sent',
    amount: 1420,
    time: 'Mon, 10:03 PM',
    riskLevel: 'HIGH',
    status: 'Blocked',
  },
  {
    id: 'TX-22009',
    name: 'Library Office',
    type: 'Received',
    amount: 120,
    time: 'Mon, 9:10 AM',
    riskLevel: 'LOW',
    status: 'Allowed',
  },
]
