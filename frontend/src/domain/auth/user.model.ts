/**
 * Auth User Model
 */

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: number;
  estado: string;
}

export interface UserModel {
  id: string;
  nombre: string;
  email: string;
  rol: number;
  estado: string;
}
