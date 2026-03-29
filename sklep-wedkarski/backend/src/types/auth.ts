export type AuthTokenPayload = {
  userId: number;
  roleId: number;
};

export type PublicUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string;
};
