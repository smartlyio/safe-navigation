import * as _ from 'lodash';

interface SafeProxy<Initial, To> {
    $: undefined | To;
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

function _safe<Initial, T>(v: Proxied): Safe<Initial, T> {
    return new Proxy(v, {
        get(target: any, key: keyof Safe<Initial, T>) {
            if (key === '$') {
                return _.get(target.value, target.path);
            }
            if (key === '$pmap') {
                const value = _.get(target.value, target.path);
                if (value !== undefined) {
                    return async (f: (t: T) => Promise<T>) => {
                        const mapped = await f(value);
                        const newTarget = _.cloneDeep(target.value);
                        _.set(newTarget, target.path, mapped);
                        return newTarget;
                    };
                }
                return async () => target.value;
            }
            return _safe({ value: target.value, path: target.path.concat([key]) });
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
