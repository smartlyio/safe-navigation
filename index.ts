import * as _ from 'lodash';

interface SafeProxy<Initial, To> {
  $: undefined | To;
  $map: (f: (t: To) => To) => Initial;
  $set: (value: To) => Initial;
  $pmap: (f: (t: To) => Promise<To>) => Promise<Initial>;
}

type RemoveIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

type UnionToIntersection<U> = ((U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? { [K in Exclude<keyof I, keyof U>]: I[K] }
  : never) &
  U;

type U<T> = {
  [K in keyof UnionToIntersection<T>]-?: NonNullable<UnionToIntersection<T>[K]>;
};

type V<T> = U<RemoveIndex<T>>;

type Safe<Initial, To> = SafeProxy<Initial, To> & { [K in keyof V<To>]: Safe<Initial, V<To>[K]> };

interface Proxied {
  value: any;
  path: Array<string | number>;
}

const noValue = Symbol;
function hasPath(target: any, path: string[]) {
  if (path.length === 0) {
    return target;
  }
  const value = _.get(target, path);
  return value == null ? noValue : value;
}

function set(target: any, path: string[], to: any): any {
  const value = hasPath(target, path);
  if (value === noValue) {
    return target;
  }
  if (path.length === 0) {
    return to;
  }
  return _.set(clonePath(target, path), path, to);
}

function clonePath(target: any, path: any[]) {
  let cursor: any = _.clone(target);
  const root = cursor;
  let i = 0;
  while (i < path.length) {
    if (!Array.isArray(cursor) && !_.isObject(cursor)) {
      break;
    }
    const at = (cursor as any)[path[i]];
    (cursor as any)[path[i]] = _.clone(at);
    if (at && (Array.isArray(at) || _.isObject(at))) {
      cursor = (cursor as any)[path[i]];
      i++;
    } else {
      break;
    }
  }
  return root;
}

function _safe<Initial, T>(v: Proxied): Safe<Initial, T> {
  return new Proxy(v, {
    get(target: any, key: string) {
      if (key === '$') {
        const value = hasPath(target.value, target.path);
        return value === noValue ? undefined : value;
      }
      if (key === '$set') {
        return (newValue: any) => {
          return set(target.value, target.path, newValue);
        };
      }
      if (key === '$map') {
        return (f: (t: T) => T) => {
          const value = hasPath(target.value, target.path);
          if (value === noValue) {
            return target.value;
          }
          return set(target.value, target.path, f(value));
        };
      }
      if (key === '$pmap') {
        return async (f: (t: T) => Promise<T>) => {
          const value = hasPath(target.value, target.path);
          if (value === noValue) {
            return target.value;
          }
          return set(target.value, target.path, await f(value));
        };
      }
      return _safe({ value: target.value, path: [...target.path, key] });
    }
  });
}

export default function safe<T>(v: T | undefined | null): Safe<T, T> {
  const p = {
    value: v,
    path: [] as Proxied['path']
  };
  return _safe<T, T>(p);
}
