/**
 * Base Entity - Clase base para todas las entidades del dominio
 */

export abstract class BaseEntity {
  constructor(
    id: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  id: string;
  createdAt?: Date;
  updatedAt?: Date;

  abstract toPrimitives(): any;
}
