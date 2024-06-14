import { UserRoleType } from 'src/entities/Users';

export interface JwtPayload {
  id: number;
  email: string;
  nickname: string;
  role: UserRoleType;
}
