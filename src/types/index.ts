export type User = {
  username: string;
  avatar: string;
};

export type Quesito = {
  id: number;
  igUsername: string;
  addedBy: User;
};
