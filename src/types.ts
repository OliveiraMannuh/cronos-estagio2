export interface InternshipEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  reportText?: string;
}

export interface InternshipStats {
  totalMinutes: number;
  goalMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
}
