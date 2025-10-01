export type User = {
  username: string;
  avatar: string;
};

export type Quesito = {
  id: number;
  igUsername: string;
  addedBy: User;
};

export type Contributor = User & {
  count: number;
};

export type Message = {
  id: number;
  text: string;
  user: User;
  timestamp: number;
};
