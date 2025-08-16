import { gql } from '@apollo/client';

export const GET_USER_CHATS = gql`
  query GetUserChats {
    chats(order_by: { created_at: desc }) {
      id
      title
      user_id
      created_at
    }
}
`;


export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
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
