
export interface Client {
  id: string;
  companyName: string;
  adminEmail: string;
  firebaseProjectId: string;
  domain: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export const clients: Client[] = [
  {
    id: 'cli_1a2b3c4d',
    companyName: 'Innovate Inc.',
    adminEmail: 'admin@innovate.com',
    firebaseProjectId: 'innovate-prod-3a1b',
    domain: 'innovate.goalleader.com',
    status: 'Active',
    createdAt: '2024-07-20T10:00:00Z',
  },
  {
    id: 'cli_5e6f7g8h',
    companyName: 'Quantum Solutions',
    adminEmail: 'ceo@quantum.dev',
    firebaseProjectId: 'quantum-main-f5d6',
    domain: 'quantum.goalleader.com',
    status: 'Active',
    createdAt: '2024-07-18T14:30:00Z',
  },
  {
    id: 'cli_9i0j1k2l',
    companyName: 'Apex Enterprises',
    adminEmail: 'it@apex.co',
    firebaseProjectId: 'apex-global-9h2j',
    domain: 'apex.goalleader.com',
    status: 'Suspended',
    createdAt: '2024-06-25T09:00:00Z',
  },
    {
    id: 'cli_3m4n5o6p',
    companyName: 'Synergy Corp',
    adminEmail: 'ops@synergy.org',
    firebaseProjectId: 'synergy-live-c7g4',
    domain: 'synergy.goalleader.com',
    status: 'Active',
    createdAt: '2024-07-22T11:00:00Z',
  },
];
