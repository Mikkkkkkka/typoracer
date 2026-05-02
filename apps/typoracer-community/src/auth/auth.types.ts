export type AuthenticatedUser = {
  id: number;
  username: string;
};

export type AuthTokenPayload = AuthenticatedUser & {
  exp: number;
  iat: number;
};
