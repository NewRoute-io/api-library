export interface RefreshTokenRepository {
  getToken: (token: string) => Promise<RefreshToken | null>;
  invalidateTokenFamily: (tokenFamily: string) => void;
  createToken: (props: CreateRefreshToken) => Promise<RefreshToken>;
}

export type RefreshToken = {
  token: string;
  tokenFamily: string;
  active: boolean;
  expiresAt: string;
};

export type CreateRefreshToken = {
  userId: string;
  expiresAt: string;
  tokenFamily?: string;
};
