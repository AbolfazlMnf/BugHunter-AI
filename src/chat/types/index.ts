export interface ChatResponse {
  id: string;
  choices: Choice[];
  created: number;
  model: string;
  service_tier: any;
  system_fingerprint: any;
  object: string;
  usage: Usage;
  nvext: Nvext;
}

export interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
  logprobs: any;
}

export interface Message {
  content: string;
  role: string;
  reasoning_content: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Nvext {
  scheduler_snapshot: SchedulerSnapshot;
  request_throughput: RequestThroughput;
}

export interface SchedulerSnapshot {
  num_running_reqs: number;
  num_waiting_reqs: number;
}

export interface RequestThroughput {
  e2e_latency_seconds: number;
  generation_tokens_per_second: number;
  draft_tokens_per_second: number;
}
