import { axiosClient } from './axiosClient';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiAPI = {
  chat: async (messages: AIChatMessage[]): Promise<string> => {
    const res = await axiosClient.post<{ reply: string }>('/ai/chat/', { messages });
    return res.data.reply;
  },
};
