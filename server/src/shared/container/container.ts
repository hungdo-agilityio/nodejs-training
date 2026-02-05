export enum ServiceLifetime {
  SINGLETON = 'singleton',
  SCOPED = 'scoped',
  TRANSIENT = 'transient',
}

type Factory<T> = (container: Container) => T;

interface ServiceRegistration<T> {
  factory: Factory<T>;
  lifetime: ServiceLifetime;
  instance?: T;
}

export class Container {
  private services = new Map<string, ServiceRegistration<any>>();
  private scopedInstances = new Map<string, any>();

  register<T>(
    token: string,
    factory: Factory<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    this.services.set(token, { factory, lifetime });
  }

  registerValue<T>(token: string, value: T): void {
    this.services.set(token, {
      factory: () => value,
      lifetime: ServiceLifetime.SINGLETON,
      instance: value,
    });
  }

  resolve<T>(token: string): T {
    const registration = this.services.get(token);

    if (!registration) {
      throw new Error(`Service not found: ${token}`);
    }

    switch (registration.lifetime) {
      case ServiceLifetime.SINGLETON:
        if (!registration.instance) {
          registration.instance = registration.factory(this);
        }
        return registration.instance;

      case ServiceLifetime.SCOPED:
        if (!this.scopedInstances.has(token)) {
          this.scopedInstances.set(token, registration.factory(this));
        }
        return this.scopedInstances.get(token);

      case ServiceLifetime.TRANSIENT:
      default:
        return registration.factory(this);
    }
  }

  createScope(): Container {
    const scopedContainer = new Container();
    scopedContainer.services = new Map(this.services);
    return scopedContainer;
  }

  clearScope(): void {
    this.scopedInstances.clear();
  }

  clear(): void {
    this.services.clear();
    this.scopedInstances.clear();
  }
}

export const container = new Container();
