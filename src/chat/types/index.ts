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
      type: IncidentResponseType.STRUCTURED_JSON;
      data: AnalysisData;
    }
  | {
      type: IncidentResponseType.SIMPLE_CHAT;
      data: FollowUpData;
    };
export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
export enum IncidentResponseType {
  STRUCTURED_JSON = `Structured_Json`,
  SIMPLE_CHAT = 'SIMPLE_CHAT',
}
