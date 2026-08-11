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
export interface ChatResponse {
  severity: 'low' | 'medium' | 'high';
  root_cause: string;
  explanation: string;
  recommendation: string;
  preventive_measures: string;
}
export type chatResponse = z.infer<typeof chatResponseSchema>;
