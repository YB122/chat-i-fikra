export interface FormattedMessage {
  userName: string;
  text: string;
  time: string;
}

export const formatMessage = (userName: string, text: string): FormattedMessage => {
  return {
    userName,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};