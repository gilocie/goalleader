
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";
import { UserRole } from '@/context/user-context';

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  status: 'online' | string;
  department: string;
  country?: string;
  branch?: string;
}
