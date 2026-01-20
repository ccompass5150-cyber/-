export enum QuestionType {
  SINGLE = '单选',
  MULTI = '多选',
}

export interface Option {
  id: string;
  label: string;
  percentage: number;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
}

export interface SurveyData {
  totalCount: number;
  questions: Question[];
}
