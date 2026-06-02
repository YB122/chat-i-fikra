import moment from 'moment';

export function formatMessage(userName, text) {
  return {userName,text,time:moment().format('h:mm a')};
}