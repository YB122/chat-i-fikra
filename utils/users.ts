interface SocketUser {
  id: string;
  userName: string;
  room: string;
}

const users: SocketUser[] = [];

export const userJoin = (id: string, userName: string, room: string): SocketUser => {
  const user = { id, userName, room };
  users.push(user);
  return user;
};

export const getCurrentUser = (id: string): SocketUser | undefined => {
  return users.find((user) => user.id === id);
};

export const userLeave = (id: string): SocketUser | undefined => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getRoomUsers = (room: string): SocketUser[] => {
  return users.filter((user) => user.room === room);
};