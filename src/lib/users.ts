
import type { ComboboxOption } from "@/components/meetings/multi-select-combobox";
import { UserRole } from '@/context/user-context';

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  status: 'online' | string;
  department: string;
}

// This file is now primarily for type definitions.
// The user data is fetched from Firestore in user-context.tsx.
