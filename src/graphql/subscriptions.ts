import { gql } from '@apollo/client';

export const MESSAGES_SUBSCRIPTION = gql`
  subscription Messages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      chat_id
      query
      response
      isError
      isGenerating
      created_at
    }
  }
`;


export const CHATS_SUBSCRIPTION = gql`
  subscription ChatsSubscription($userId: uuid!) {
    chats(
      where: { user_id: { _eq: $userId } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`;
