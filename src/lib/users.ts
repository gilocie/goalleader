
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";

export const allUsers: ComboboxOption[] = [
    { value: 'patrick-achitabwino-m1', label: 'Patrick Achitabwino' },
    { value: 'frank-mhango-m2', label: 'Frank Mhango' },
    { value: 'denis-maluwasa-m3', label: 'Denis Maluwasa' },
    { value: 'gift-banda-m4', label: 'Gift Banda' },
    { value: 'chiyanjano-mkandawire-m5', label: 'Chiyanjano Mkandawire' },
    { value: 'wezi-chisale-m6', label: 'Wezi Chisale' },
    { value: 'charity-moyo-m7', label: 'Charity Moyo' },
    { value: 'fumbani-mwenefumbo-m8', label: 'Fumbani Mwenefumbo' },
    { value: 'rose-kabudula-m9', label: 'Rose Kabudula' },
    { value: 'user', label: 'You' },
];

export const allTeamMembers = [
  {
    id: 'patrick-achitabwino-m1',
    name: 'Patrick Achitabwino (You)',
    role: 'Team Leader' as const,
    status: 'online' as const,
    department: 'Customer Service'
  },
  {
    id: 'frank-mhango-m2',
    name: 'Frank Mhango',
    role: 'Consultant' as const,
    status: 'offline' as const,
    department: 'Customer Service'
  },
  {
    id: 'denis-maluwasa-m3',
    name: 'Denis Maluwasa',
    role: 'Consultant' as const,
    status: 'online' as const,
    department: 'Customer Service'
  },
  {
    id: 'gift-banda-m4',
    name: 'Gift Banda',
    role: 'Frontend Developer' as const,
    status: 'online' as const,
    department: 'Engineering'
  },
  {
    id: 'chiyanjano-mkandawire-m5',
    name: 'Chiyanjano Mkandawire',
    role: 'Backend Developer' as const,
    status: 'offline' as const,
    department: 'Engineering'
  },
   {
    id: 'wezi-chisale-m6',
    name: 'Wezi Chisale',
    role: 'Marketing Specialist' as const,
    status: 'online' as const,
    department: 'Marketing'
  },
  {
    id: 'charity-moyo-m7',
    name: 'Charity Moyo',
    role: 'Content Creator' as const,
    status: 'offline' as const,
    department: 'Marketing'
  },
   {
    id: 'fumbani-mwenefumbo-m8',
    name: 'Fumbani Mwenefumbo',
    role: 'IT Support' as const,
    status: 'online' as const,
    department: 'ICT'
  },
  {
    id: 'rose-kabudula-m9',
    name: 'Rose Kabudula',
    role: 'Admin' as const,
    status: 'online' as const,
    department: 'ICT'
  },
];
