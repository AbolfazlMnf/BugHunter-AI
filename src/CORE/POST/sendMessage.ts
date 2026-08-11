/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { chatResponseSchema } from 'src/chat/Schemas/chat-validation.schema';
import { IChatMessage, IncidentRequestType } from 'src/chat/types';
const stream = false;

export const sendRequest = async (
  messages: IChatMessage[],
  incidentType: IncidentRequestType = IncidentRequestType.INITIAL_ANALYSIS,
) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  const invokeUrl = process.env.INVOKE_URL;

  if (!apiKey || !invokeUrl) {
    throw new InternalServerErrorException('API configurations are missing');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const payload: any = {
    messages,
    model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    max_tokens: 5536,
    reasoning_budget: 3084,
    stream: stream,
    temperature: 0.5,
    top_p: 0.95,
  };
  if (incidentType === IncidentRequestType.INITIAL_ANALYSIS) {
    payload.response_format = {
      type: 'json_schema',
      json_schema: {
        name: 'incident_analysis',
        schema: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },

            root_cause: {
              type: 'string',
            },

            explanation: {
              type: 'string',
            },

            recommendation: {
              type: 'string',
            },

            preventive_measures: {
              type: 'string',
            },
          },

          required: [
            'severity',
            'root_cause',
            'explanation',
            'recommendation',
            'preventive_measures',
          ],

          additionalProperties: false,
        },
      },
    };
  }
  try {
    const response = await axios.post(invokeUrl, payload, {
      headers: headers,
      responseType: stream ? 'stream' : 'json',
    });
    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('No content received from AI');
    }
    if (incidentType === IncidentRequestType.INITIAL_ANALYSIS) {
      const parsedContent = chatResponseSchema.safeParse(JSON.parse(content));
      if (!parsedContent.success) {
        console.error('Invalid AI response:', parsedContent.error.issues);
        throw new InternalServerErrorException(
          'AI returned an invalid response format',
        );
      }
      return {
        type: IncidentRequestType.INITIAL_ANALYSIS,
        data: parsedContent.data,
      };
    }

    return { type: IncidentRequestType.FOLLOW_UP, data: { text: content } };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new InternalServerErrorException('Failed to send message to API');
  }
};
