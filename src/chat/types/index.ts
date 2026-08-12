import z from 'zod';
import { chatResponseSchema } from '../Schemas/chat-validation.schema';

export interface NvidiaResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
      reasoning?: string;
    };
  }>;
}

export type AnalysisData = {
  severity: 'low' | 'medium' | 'high';
  root_cause: string;
  explanation: string;
  recommendation: string;
  preventive_measures: string;
};

export type FollowUpData = {
  text: string;
};

export type ChatResponse =
  | {
      type: IncidentRequestType.INITIAL_ANALYSIS;
      data: AnalysisData;
    }
  | {
      type: IncidentRequestType.FOLLOW_UP;
      data: FollowUpData;
    };
export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
export enum IncidentRequestType {
  INITIAL_ANALYSIS = 'INITIAL_ANALYSIS',
  FOLLOW_UP = 'FOLLOW_UP',
}
