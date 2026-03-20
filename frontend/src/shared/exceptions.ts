/**
 * Excepciones personalizadas del sistema
 * 
 * Estructura consistente con el backend para manejar errores
 * en toda la aplicación React.
 */

export class ApplicationException extends Error {
  message: string;
  code: string;
  details?: Record<string, any>;
  statusCode?: number;

  constructor(
    message: string,
    code: string = 'APPLICATION_ERROR',
    details?: Record<string, any>,
    statusCode?: number
  ) {
    super(message);
    this.message = message;
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.name = 'ApplicationException';
  }
}

export class DomainException extends ApplicationException {
  constructor(message: string, code?: string, details?: Record<string, any>) {
    super(message, code || 'DOMAIN_ERROR', details);
    this.name = 'DomainException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    const message = `${entityName} con ID '${identifier}' no fue encontrado`;
    super(message, 'ENTITY_NOT_FOUND', {
      entityName,
      identifier,
    });
    this.name = 'EntityNotFoundException';
  }
}

export class InvalidValueObjectException extends DomainException {
  constructor(valueObjectName: string, message: string) {
    const fullMessage = `${valueObjectName}: ${message}`;
    super(fullMessage, 'INVALID_VALUE_OBJECT', {
      valueObject: valueObjectName,
      reason: message,
    });
    this.name = 'InvalidValueObjectException';
  }
}

export class InvalidEntityStateException extends DomainException {
  constructor(entityName: string, message: string) {
    const fullMessage = `${entityName} en estado inválido: ${message}`;
    super(fullMessage, 'INVALID_ENTITY_STATE', {
      entity: entityName,
      reason: message,
    });
    this.name = 'InvalidEntityStateException';
  }
}

export class InvalidInputException extends ApplicationException {
  constructor(message: string, field?: string, statusCode: number = 400) {
    super(message, 'INVALID_INPUT', { field }, statusCode);
    this.name = 'InvalidInputException';
  }
}

export class BusinessRuleViolationException extends ApplicationException {
  constructor(message: string, rule?: string, statusCode: number = 422) {
    super(message, 'BUSINESS_RULE_VIOLATION', { rule }, statusCode);
    this.name = 'BusinessRuleViolationException';
  }
}

export class RepositoryException extends ApplicationException {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'REPOSITORY_ERROR', undefined, statusCode);
    this.name = 'RepositoryException';
  }
}

export class NetworkException extends ApplicationException {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', undefined, statusCode || 503);
    this.name = 'NetworkException';
  }
}

export class ConflictException extends ApplicationException {
  constructor(message: string, field?: string) {
    super(message, 'CONFLICT', { field }, 409);
    this.name = 'ConflictException';
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string = 'No autorizado') {
    super(message, 'UNAUTHORIZED', undefined, 401);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string = 'Acceso denegado') {
    super(message, 'FORBIDDEN', undefined, 403);
    this.name = 'ForbiddenException';
  }
}
