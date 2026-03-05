export interface User {
  name: string;
  email: string;
}

export interface Criterion {
  name: string;
  score: number;
  max: number;
  feedback: string;
}

export interface GradeResult {
  aiScore: number;
  grade: number;
  letter: string;
  summary: string;
  criteria: Criterion[];
}

export interface EssayFile {
  id: number;
  name: string;
  score: number | null;
}

export interface StoredFile {
  name: string;
  type: "Rubric" | "Essay";
  date: string;
  size: string;
}
