export interface RefreshTokenRepository {
  getToken: (token: string) => Promise<RefreshToken | null>;
  invalidateTokenFamily: (tokenFamily: string) => void;
  createToken: (props: CreateRefreshToken) => Promise<RefreshToken>;
}

export type RefreshToken = {
  userId: number;
  token: string;
  tokenFamily: string;
  active: boolean;
  expiresAt: string;
};

export type CreateRefreshToken = {
  userId: number;
  expiresAt: string;
  tokenFamily?: string;
};
