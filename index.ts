import * as _ from 'lodash';

interface SafeProxy<Initial, To> {
    $: undefined | To;
    $map: (f: ((t: To) => To)) => Initial;
    $set: (value: To) => Initial;
    $pmap: (f: ((t: To) => Promise<To>)) => Promise<Initial>;
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((
    k: infer I
    ) => void)
    ? I
    : never;

export type U<T> = {
    [K in keyof Required<UnionToIntersection<T>>]: NonNullable<UnionToIntersection<T>[K]>
};
type Safe<Initial, To> = SafeProxy<Initial, To> & { [K in keyof U<To>]: Safe<Initial, U<To>[K]> };

interface Proxied {
    value: any;
    path: Array<string | number>;
}

const noValue = Symbol;

function hasPath(target: any, path: Array<string>) {
    if (path.length === 0) {
        return target;
    }
    const root = path.length > 1 ? _.get(target, path.slice(0, -1)) : target;
    if (!root || typeof root !== 'object') {
        return noValue;
    }
    const lastPath = path[path.length - 1];
    if (Array.isArray(root)) {
        if (!lastPath.match(/([1-9][0-9]*)|0/)) {
            return noValue;
        }
        const ix = Number(lastPath);
        if (isNaN(ix) || ix < 0 || ix >= root.length) {
            return noValue;
        }
        return root[ix];
    }
    return root[lastPath];
}

function set(target: any, path: string[], to: any): any {
    const value = hasPath(target, path);
    if (value !== noValue) {
        if (path.length === 0) {
            return to;
        }
        return _.set(_.cloneDeep(target), path, to);
    }
    return target;
}

function _safe<Initial, T>(v: Proxied): Safe<Initial, T> {
    return new Proxy(v, {
        get(target: any, key: keyof Safe<Initial, T>) {
            if (key === '$') {
                const value = hasPath(target.value, target.path);
                return value === noValue ? undefined : value;
            }
            if (key === '$set') {
                return (newValue: any) => set(target.value, target.path, newValue);
            }
            if (key === '$map') {
                return (f: (t: T) => T) => {
                    const value = hasPath(target.value, target.path);
                    if (value === noValue) {
                        return target.value;
                    }
                    return set(target.value, target.path, f(value))
                }
            }
            if (key === '$pmap') {
                return async (f: (t: T) => Promise<T>) => {
                    const value = hasPath(target.value, target.path);
                    if (value !== noValue) {
                        const mapped = await f(value);
                        const newTarget = _.cloneDeep(target.value);
                        _.set(newTarget, target.path, mapped);
                        return newTarget;
                    };
                    return target.value
                }
            }
            return _safe({ value: target.value, path: [...target.path, key] });
        }
    });
}
export default function safe<T>(v: T): Safe<T, T> {
    const p = {
        value: v,
        path: [] as Proxied['path']
    };
    return _safe(p);
}
