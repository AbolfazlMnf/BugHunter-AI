import { z } from 'zod';
export const chatResponseSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  root_cause: z.string(),
  explanation: z.string(),
  recommendation: z.string(),
  preventive_measures: z.string(),
});
