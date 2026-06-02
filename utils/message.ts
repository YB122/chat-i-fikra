import moment from "moment";

export interface MessageFormat {
  userName: string;
  text: string;
  time: string;
}

export function formatMessage(userName: string, text: string): MessageFormat {
  return { userName, text, time: moment().format("h:mm a") };
}
