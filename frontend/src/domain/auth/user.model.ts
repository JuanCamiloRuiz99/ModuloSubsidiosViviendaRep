import { Role } from "./role.enum";

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  token: string;
}
