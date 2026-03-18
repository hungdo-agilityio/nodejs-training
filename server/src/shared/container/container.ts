export class Container {
  private services = new Map<string, unknown>();

  registerValue<T>(token: string, value: T): void {
    this.services.set(token, value);
  }

  resolve<T>(token: string): T {
    const instance = this.services.get(token);

    if (instance === undefined) {
      throw new Error(`Service not found: ${token}`);
    }

    return instance as T;
  }

  clear(): void {
    this.services.clear();
  }
}

export const container = new Container();
