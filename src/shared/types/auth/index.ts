import { Role } from 'src/user/Schema/user.schema';

export interface IUserPayload {
  _id: string;
  role: Role;
}
