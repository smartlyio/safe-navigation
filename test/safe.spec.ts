import safe from '../index';
import * as jsc from 'jsverify';
import * as _ from 'lodash';
import * as assert from 'assert';

interface Type {
  a?: {
    b?: number;
  };
  arr?: Array<{ value?: number }>;
}

function roll(target: any, path: Array<string | number>): any {
  return path.reduce((o: any, index: any) => o[index], safe(target));
}

function objectMatchingPath(path: Array<string | number>, leaf: any): any {
  if (path.length === 0) {
    return leaf;
  }
  const head = path[0];
  if (_.isNumber(head)) {
    const v = [];
    v[head] = objectMatchingPath(path.slice(1), leaf);
    return v;
  }
  const v: any = { a: 1, b: 2, c: 3 };
  v[head] = objectMatchingPath(path.slice(1), leaf);
  return v;
}

const paths = jsc.array(
  jsc.oneof([jsc.integer(0, 100), jsc.suchthat(jsc.asciistring, n => !n.match(/\$|[0-9]/))])
);

describe('safe', () => {
  describe('.$pmap', () => {
    it('sets the value', async () => {
      const v: Type = { a: { b: 1 } };
      const n = await safe(v).a.b.$pmap(async o =>
        o != null ? o + 1 : assert.fail('cant happen')
      );
      expect(safe(n).a.b.$).toEqual(2);
    });

    it('does not set value to undefined leaf', async () => {
      const v: Type = { a: { b: undefined } };
      const n = await safe(v).a.b.$pmap(async () => assert.fail('cant happen'));
      expect(safe(n).a.b.$).toEqual(undefined);
    });

    it('does not map the value if the path is undefined', async () => {
      const v: Type = { a: { b: 1 } };
      // @ts-expect-error
      const n = await safe(v).missing.value.$pmap(async () => 1);
      expect(safe(n).missing.$).toEqual(undefined);
    });

    it('does not map the value if the array index is undefined', async () => {
      const v: Type = { arr: [{ value: 1 }] };
      const n = await safe(v).arr[1].$pmap(async () => {
        throw new Error('cant happen');
      });
      expect(safe(n).arr[1].$).toEqual(undefined);
    });
  });

  describe('.$map', () => {
    jsc.property('maps values', paths, path => {
      const target = objectMatchingPath(path, 'X');
      const newValue = roll(target, path).$map((x: any) => 'new ' + x);
      expect(roll(newValue, path).$).toEqual('new X');
      return true;
    });

    jsc.property(
      'is equivalent to get + set for all objects and paths',
      paths,
      paths,
      (anyObjectPath, path) => {
        const target = objectMatchingPath(anyObjectPath, 'X');
        const map = (n: any) => 'mapped ' + n;
        const mappedValue = roll(target, path).$map(map);
        const setValue = roll(target, path).$set(map(roll(target, path).$));
        expect(roll(mappedValue, path).$).toEqual(roll(setValue, path).$);
        return true;
      }
    );
  });

  describe('.$set', () => {
    jsc.property('sets value to any path', paths, path => {
      const target = objectMatchingPath(path, 'X');
      const newValue = roll(target, path).$set('new value');
      expect(roll(newValue, path).$).toEqual('new value');
      return true;
    });

    it('handles [0] path', () => {
      const path = [0];
      const target = objectMatchingPath(path, 'X');
      const newValue = roll(target, path).$set('new value');
      expect(roll(newValue, path).$).toEqual('new value');
    });

    it('sets the value', () => {
      const v: Type = { a: { b: 1 } };
      const n = safe(v).a.b.$set(2);
      expect(safe(n).a.b.$).toEqual(2);
    });

    it('does not set the value to undefined leaf', () => {
      const v: Type = { a: { b: undefined } };
      const n = safe(v).a.b.$set(2);
      expect(safe(n).a.b.$).toBeUndefined();
    });

    it('does not set the value if the path is undefined', () => {
      const v: Type = { a: { b: 1 } };
      // @ts-expect-error
      const n = safe(v).missing.value.$set(1);
      expect(safe(n).missing.$).toEqual(undefined);
    });

    it('does not set the value if the array index is undefined', () => {
      const v: Type = { arr: [{ value: 1 }] };
      const n = safe(v).arr[1].$set({ value: 2 });
      expect(safe(n).arr[1].$).toEqual(undefined);
    });
  });

  describe('.$', () => {
    jsc.property('gets value', paths, path => {
      const target = objectMatchingPath(path, 'X');
      const s = roll(target, path);
      expect(s.$).toEqual(path.length > 0 ? _.get(target, path) : target);
      return true;
    });

    it('gets the value', () => {
      const v: Type = { a: { b: 1 } };
      expect(safe(v).a.b.$).toEqual(1);
    });

    it('goes through arrays', () => {
      const v: Type = { arr: [{ value: 1 }] };
      expect(safe(v).arr[0].value.$).toEqual(1);
    });

    it('produces undefined if path does not exist', () => {
      const v: Type = { a: { b: 1 } };
      // @ts-expect-error
      expect(safe(v).missing.$).toBe(undefined);
    });
  });
});

type UnionType = { b: string } | { a: number };

type UnionTypeWithIndex = { b: string } | { a: number; [key: string]: unknown };

type NestedUnion = { a: { x: number } } | { b: { x: string } };

type SharingUnion = { a: string } | { a: number };

describe('union type traversal', () => {
  const value: any = null as any;
  it('narrows to union value', () => {
    const num: number | undefined = safe<NestedUnion>(value).a.x.$;
    expect(num).toBeFalsy();
  });

  it('narrows to union value with indexed keys', () => {
    const num: number | undefined = safe<UnionTypeWithIndex>(value).a.$;
    expect(num).toBeFalsy();
  });

  it('rejects mismatching type from nested union', () => {
    // @ts-expect-error
    const num: number | undefined = safe<NestedUnion>(value).b.x.$;
    expect(num).toBeFalsy();
  });

  it('rejects missing type from union', () => {
    // @ts-expect-error
    const num: number | undefined = safe<NestedUnion>(value).b.r.$;
    expect(num).toBeFalsy();
  });

  it('makes union of leaf types', () => {
    const num: string | number | undefined = safe<SharingUnion>(value).a.$;
    expect(num).toBeFalsy();
  });

  it('narrows to union value', () => {
    const num: number | undefined = safe<UnionType>(value).a.$;
    expect(num).toBeFalsy();
  });

  it("rejects mismatching type from union'", () => {
    // @ts-expect-error
    const num: number | undefined = safe<UnionType>(value).b.$;
    expect(num).toBeFalsy();
  });
});
