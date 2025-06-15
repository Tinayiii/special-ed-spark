
export type Intent = 'lesson-plan' | 'image-generation' | 'ppt-creation' | 'unknown' | 'greeting';

export type ConversationPhase = 'greeting' | 'intent-recognition' | 'information-gathering' | 'task-fulfillment';

export interface TeachingInfo {
  topic?: string;
  grade?: string;
  objective?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
