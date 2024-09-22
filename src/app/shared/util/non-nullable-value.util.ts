export function ensureNonNullable<T extends object>(obj: T): NonNullable<T> {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value === null || value === undefined) {
        throw new Error(`Property ${key} is null or undefined`);
      }
      result[key] = value;
    }
  }
  return result as NonNullable<T>;
}