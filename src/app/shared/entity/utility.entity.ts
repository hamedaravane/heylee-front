function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamelCase(str: string): string {
  return str.replace(/_./g, match => match[1].toUpperCase());
}

function transformKeys(obj: any, transformFn: (key: string) => string): any {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformFn));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (acc, key) => {
        const transformedKey = transformFn(key);
        acc[transformedKey] = transformKeys(obj[key], transformFn);
        return acc;
      },
      {} as Record<string, any>
    );
  }
  return obj;
}

export function toCamelCase<T, U>(obj: T): U {
  return transformKeys(obj, snakeToCamelCase) as U;
}

export function toSnakeCase<T, U>(obj: T): U {
  return transformKeys(obj, camelToSnakeCase) as U;
}
