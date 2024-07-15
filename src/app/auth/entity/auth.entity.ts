export interface AuthResponseDTO {
  ok: boolean;
  result: {
    user_id: number;
    token: string;
    expires_at: number;
    username: string;
  };
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}

export class User implements User {
  constructor(
    public id: number,
    public username: string
  ) {}
}

export class AuthToken implements AuthToken {
  constructor(
    public token: string,
    public expiresAt: number
  ) {}
}

export function mapAuthResponseDTOToModels(dto: AuthResponseDTO): { user: User, authToken: AuthToken } {
  const user = new User(dto.result.user_id, dto.result.username);
  const authToken = new AuthToken(dto.result.token, dto.result.expires_at);

  return { user, authToken };
}
