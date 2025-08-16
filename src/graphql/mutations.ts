import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      user_id
      created_at
    }
  }
`;


export const CREATE_MESSAGE = gql`
  mutation CreateMessage($chatId: uuid!, $query: String!) {
    insert_messages_one(object: { chat_id: $chatId, query: $query }) {
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

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chatId: uuid!, $title: String!) {
    update_chats_by_pk(
      pk_columns: { id: $chatId }
      _set: { title: $title }
    ) {
      id
      title
      updated_at
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chatId } }) {
      affected_rows
    }
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`;
