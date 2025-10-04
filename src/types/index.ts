import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  username: string;
  avatar: string;
  quesitosBalance: number;
};

export type Quesito = {
  id:string;
  name: string;
  igUsername: string;
  location: string;
  addedBy: {
    userId: string;
    username: string;
    avatar: string;
  };
  revealedBy: string[]; // Array of user IDs that have revealed this quesito
  createdAt: Timestamp;
};

export type Contributor = {
  id: string;
  username: string;
  avatar: string;
  count: number;
};

// The Message type is no longer needed
// export type Message = {
//   id: string;
//   text: string;
//   user: {
//     userId: string;
//     username: string;
//     avatar: string;
//   };
//   timestamp: Timestamp;
// };
