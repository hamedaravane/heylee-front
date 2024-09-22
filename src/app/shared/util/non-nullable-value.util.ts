export function getNonNullableValue<T extends object>(obj: T): { [K in keyof T]: NonNullable<T[K]> } {
  const result: Partial<{ [K in keyof T]: NonNullable<T[K]> }> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        result[key] = value as NonNullable<T[typeof key]>;
      } else {
        throw new Error(`Property ${String(key)} is null or undefined`);
      }
    }
  }

  return result as { [K in keyof T]: NonNullable<T[K]> };
}