export const MAX_USER_MESSAGE_LENGTH = 256;

export function truncateUserMessage(text: string): string {
  return text.slice(0, MAX_USER_MESSAGE_LENGTH);
}

export function isUserMessageTooLong(text: string): boolean {
  return text.length > MAX_USER_MESSAGE_LENGTH;
}
