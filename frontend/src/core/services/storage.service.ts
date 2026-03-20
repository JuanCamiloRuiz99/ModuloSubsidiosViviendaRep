/**
 * Storage Service - Gestión de localStorage de forma tipada
 */

class StorageService {
  private readonly PREFIX = 'app_';

  // Usuario
  setUser(user: any): void {
    this.setItem('user', user);
  }

  getUser(): any {
    return this.getItem('user');
  }

  removeUser(): void {
    this.removeItem('user');
  }

  // Token
  setToken(token: string): void {
    this.setItem('access_token', token);
  }

  getToken(): string | null {
    return this.getItem('access_token');
  }

  removeToken(): void {
    this.removeItem('access_token');
  }

  // Métodos help
  private setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${this.PREFIX}${key}`, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  }

  private getItem<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }

  // Limpiar todo
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
}

export default new StorageService();
