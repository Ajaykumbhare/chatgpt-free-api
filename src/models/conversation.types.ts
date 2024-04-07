type Author = {
  role: string;
  name: string | null;
  metadata: Record<string, any>;
};

type ContentPart = {
  content_type: string;
  parts: string[];
};

type Message = {
  id: string;
  author: Author;
  create_time: number;
  update_time: number | null;
  content: ContentPart;
  status: string;
  end_turn: boolean;
  weight: number;
  metadata: Record<string, any>;
  recipient: string;
};

export type ConversationData = {
  message: Message;
  conversation_id: string;
  error: any;
};

export type ConversationDataResponse = {
  message: string;
  conversation_id: string;
};
