
export interface GradingResult {
  questionNumber: number;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface GradingResponse {
  totalQuestions: number;
  correctCount: number;
  score: number;
  results: GradingResult[];
  feedback: string;
}

export enum AppMode {
  GRADER = 'GRADER',
  EDITOR = 'EDITOR',
  GENERATOR = 'GENERATOR'
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
