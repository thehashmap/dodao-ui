import { GuideIntegrationFragment } from '@/graphql/generated/generated-types';

export interface ChoiceError {
  content?: boolean;
}

export interface QuestionError {
  content?: boolean;
  choices?: Record<string, ChoiceError>;
  answerKeys?: boolean;
  explanation?: boolean;
}

export interface UserInputError {
  label?: boolean;
}

export interface StepError {
  name?: boolean;
  content?: boolean;
  stepItems?: Record<string, QuestionError | UserInputError>;
}

export type KeyOfGuideIntegration = keyof GuideIntegrationFragment;

export interface GuideError {
  name?: boolean;
  content?: boolean;
  thumbnail?: boolean;
  steps?: Record<string, StepError>;
  guideIntegrations?: Partial<Record<KeyOfGuideIntegration, boolean | undefined>>;
}

export interface GuideSubmissionError {
  steps?: Record<string, StepError>;
}

export interface ByteSubmissionError {
  steps?: Record<string, StepError>;
}

export interface GuideCourseError {
  name?: boolean;
  excerpt?: boolean;
  content?: boolean;
  bundleGuides?: { [key: string]: boolean };
}

export interface TaskError {
  title?: boolean;
  excerpt?: boolean;
  details?: boolean;
  items?: Record<string, QuestionError | UserInputError>;
}
