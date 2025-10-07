
'use client';

import { ApprovedContentActions } from './approved-content-actions';
import type { Suggestion } from "@/types/marketing";

interface ApprovedContentTableProps {
  content: Suggestion[];
}

export function ApprovedContentTable({ content }: ApprovedContentTableProps) {
  return <ApprovedContentActions content={content} />;
}
