interface User {
  id: string;
  userName: string;
  room: string;
}

const users: User[] = [];

export function userJoin(id: string, userName: string, room: string): User {
  const user: User = { id, userName, room };
  users.push(user);
  return user;
}

export function getCurrentUser(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function userLeave(id: string): User | undefined {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

export function getRoomUsers(room: string): User[] {
  return users.filter((user) => user.room === room);
}
