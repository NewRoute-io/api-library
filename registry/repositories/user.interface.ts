export interface UserRepository {
  getUser: (username: string) => Promise<User | null>;
  getUserById: (id: string) => Promise<User | null>;
  createAuthBasicUser: (props: AuthBasicSignup) => Promise<User>;
}

export type User = {
  userId: string;
  username: string;
  email?: string;
  password: string;
  createdAt: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type AuthBasicSignup = {
  username: string;
  hashedPass: string;
  email?: string;
};
