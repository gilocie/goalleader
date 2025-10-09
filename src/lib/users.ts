
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";
import { UserRole } from '@/context/user-context';

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
];

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  status: 'online' | 'offline';
  department: string;
}


export const allTeamMembers: TeamMember[] = [
  {
    id: 'patrick-achitabwino-m1',
    name: 'Patrick Achitabwino',
    role: 'Team Leader',
    status: 'online',
    department: 'Customer Service'
  },
  {
    id: 'frank-mhango-m2',
    name: 'Frank Mhango',
    role: 'Consultant',
    status: 'offline',
    department: 'Customer Service'
  },
  {
    id: 'denis-maluwasa-m3',
    name: 'Denis Maluwasa',
    role: 'Consultant',
    status: 'online',
    department: 'Customer Service'
  },
  {
    id: 'gift-banda-m4',
    name: 'Gift Banda',
    role: 'Frontend Developer',
    status: 'online',
    department: 'Engineering'
  },
  {
    id: 'chiyanjano-mkandawire-m5',
    name: 'Chiyanjano Mkandawire',
    role: 'Backend Developer',
    status: 'offline',
    department: 'Engineering'
  },
   {
    id: 'wezi-chisale-m6',
    name: 'Wezi Chisale',
    role: 'Marketing Specialist',
    status: 'online',
    department: 'Marketing'
  },
  {
    id: 'charity-moyo-m7',
    name: 'Charity Moyo',
    role: 'Content Creator',
    status: 'offline',
    department: 'Marketing'
  },
   {
    id: 'fumbani-mwenefumbo-m8',
    name: 'Fumbani Mwenefumbo',
    role: 'IT Support',
    status: 'online',
    department: 'ICT'
  },
  {
    id: 'rose-kabudula-m9',
    name: 'Rose Kabudula',
    role: 'Admin',
    status: 'online',
    department: 'ICT'
  },
];
