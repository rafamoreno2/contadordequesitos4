export type User = {
  username: string;
  avatar: string;
  quesitosBalance: number;
};

export type Quesito = {
  id: number;
  name: string;
  igUsername: string;
  addedBy: User;
  revealedBy: string[]; // Array of usernames that have revealed this quesito
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
