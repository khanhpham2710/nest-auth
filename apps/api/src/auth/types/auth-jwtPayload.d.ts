import { Role } from 'generated/prisma';

export type AuthJwtPayload = {
  sub: number;
};

export type AuthenticatedRequest = Request & {
  user: {
    id: number;
    name: string;
    role: Role;
  };
};
