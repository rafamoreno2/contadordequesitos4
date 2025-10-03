import type { User as FirebaseUser } from 'firebase/auth';

export type User = {
  id: string; // Firebase UID
  username: string;
  avatar: string;
  quesitosBalance: number;
};

export type Quesito = {
  id: string; // Firestore Document ID
  name: string;
  igUsername: string;
  addedBy: {
    userId: string;
    username: string;
    avatar: string;
  };
  revealedBy: string[]; // Array of user IDs that have revealed this quesito
  createdAt: number;
};

export type Contributor = {
  id: string;
  username: string;
  avatar: string;
  count: number;
};

export type Message = {
  id: string; // Firestore Document ID
  text: string;
  user: {
    userId: string;
    username: string;
    avatar: string;
  };
  timestamp: number;
};

// This is the shape of the user profile document in Firestore
export type UserProfile = {
  username: string;
  avatar: string;
  quesitosBalance: number;
}
