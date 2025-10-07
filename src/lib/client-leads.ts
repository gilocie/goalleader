
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";

export interface Lead {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  status: string;
}

export const initialLeads: Lead[] = [
  { name: 'Sophia Davis', company: 'Innovate Inc.', email: 'sophia@innovate.com', phone: '+265 99 123 4567', service: 'UX/UI Design', status: 'New' },
  { name: 'Liam Martinez', company: 'Quantum Solutions', email: 'liam@quantum.com', phone: '+265 88 234 5678', service: 'Frontend Dev', status: 'Contacted' },
  { name: 'Charlotte Rodriguez', company: 'Apex Enterprises', email: 'charlotte@apex.com', phone: '+265 99 345 6789', service: 'Backend Dev', status: 'Qualified' },
  { name: 'Noah Garcia', company: 'Synergy Corp', email: 'noah@synergy.com', phone: '+265 88 456 7890', service: 'QA Testing', status: 'Proposal Sent' },
  { name: 'Amelia Hernandez', company: 'Stellar Systems', email: 'amelia@stellar.com', phone: '+265 99 567 8901', service: 'Cloud Services', status: 'Negotiation' },
  { name: 'Oliver Wilson', company: 'Pinnacle Group', email: 'oliver@pinnacle.com', phone: '+265 88 678 9012', service: 'UX/UI Design', status: 'New' },
];

export const clientLeadsForCombobox: ComboboxOption[] = initialLeads.map(lead => ({
    value: lead.email,
    label: `${lead.name} (${lead.company})`,
}));
