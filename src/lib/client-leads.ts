
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";

export interface Lead {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  status: string;
}

// This initial data is now only for fallback or demonstration.
// The primary data source is Firestore via MarketingContext.
export const initialLeads: Lead[] = [
  { id: '1', name: 'Sophia Davis', company: 'Innovate Inc.', email: 'sophia@innovate.com', phone: '+265 99 123 4567', service: 'UX/UI Design', status: 'New' },
  { id: '2', name: 'Liam Martinez', company: 'Quantum Solutions', email: 'liam@quantum.com', phone: '+265 88 234 5678', service: 'Frontend Dev', status: 'Contacted' },
  { id: '3', name: 'Charlotte Rodriguez', company: 'Apex Enterprises', email: 'charlotte@apex.com', phone: '+265 99 345 6789', service: 'Backend Dev', status: 'Qualified' },
  { id: '4', name: 'Noah Garcia', company: 'Synergy Corp', email: 'noah@synergy.com', phone: '+265 88 456 7890', service: 'QA Testing', status: 'Proposal Sent' },
  { id: '5', name: 'Amelia Hernandez', company: 'Stellar Systems', email: 'amelia@stellar.com', phone: '+265 99 567 8901', service: 'Cloud Services', status: 'Negotiation' },
  { id: '6', name: 'Oliver Wilson', company: 'Pinnacle Group', email: 'oliver@pinnacle.com', phone: '+265 88 678 9012', service: 'UX/UI Design', status: 'New' },
];

export const clientLeadsForCombobox: ComboboxOption[] = initialLeads.map(lead => ({
    value: lead.email,
    label: `${lead.name} (${lead.company})`,
}));
