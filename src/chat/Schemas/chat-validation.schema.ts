import { z } from 'zod';
export const chatResponseSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),

  rootCause: z.string(),

  confidence: z.number(),

  evidence: z.array(
    z.object({
      filePath: z.string(),
      reason: z.string(),
    }),
  ),

  explanation: z.string(),

  recommendations: z.array(z.string()),

  insufficientContext: z.boolean(),
});
