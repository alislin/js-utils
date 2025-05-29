/*
 * @Author: Lin Ya
 * @Date: 2023-09-21 12:04:20
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-05-09 18:09:12
 * @Description: Set 操作
 */
export class SetHelper<T> {
    private set: Set<T>;
    items() {
        return this.set;
    }

    constructor(iterable?: Iterable<T>) {
        this.set = new Set(iterable);
    }
    /**
     * 验证集合是否为有效集合
     * @param {*} set
     * @returns
     */
    _isValid = (set: any) => {
        return set && set instanceof Set && set.size > 0;
    };

    // 代理所有必要的Set方法
    get size() { return this.set.size; }
    has(value: T) { return this.set.has(value); }
    add(value: T) { this.set.add(value); return this; }
    delete(value: T) { return this.set.delete(value); }
    clear() { this.set.clear(); }
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
        this.set.forEach(callbackfn, thisArg);
    }
    [Symbol.iterator]() { return this.set[Symbol.iterator](); }
    entries() { return this.set.entries(); }
    keys() { return this.set.keys(); }
    values() { return this.set.values(); }

    union(set: Set<T>) {
        if (!this._isValid(set)) return new SetHelper<T>(this.set);
        return new SetHelper<T>([...this.set, ...set]);
    }

    difference(set: Set<T>) {
        if (!this._isValid(set)) return new SetHelper<T>(this.set);
        const differenceSet = new SetHelper<T>();
        this.set.forEach((item) => {
            !set.has(item) && differenceSet.add(item);
        });
        return differenceSet;
    }

    intersection(set: Set<T>) {
        const intersectionSet = new SetHelper<T>();
        if (!this._isValid(set)) return intersectionSet;
        const [smallerSet, biggerSet] =
            set.size <= this.size ? [set, this.set] : [this.set, set];
        smallerSet.forEach((item) => {
            biggerSet.has(item) && intersectionSet.add(item);
        });
        return intersectionSet;
    }

    intersectionDifference(set: Set<T>) {
        if (!this._isValid(set)) return new SetHelper<T>(this.set);
        return new SetHelper<T>([
            ...this.difference(set),
            ...new SetHelper(set).difference(this.set),
        ]);
    }
    isSubset(set: Set<T>) {
        if (!this._isValid(set)) return false;
        return (
            this.size <= set.size && [...this.set].every((item) => set.has(item))
        );
    }
    isSuperset(set: Set<T>) {
        if (!this._isValid(set)) return false;
        return (
            this.size >= set.size && [...set].every((item) => this.has(item))
        );
    }
}

// class StaticSet<T> extends SetHelper<T> {
//     constructor(items:Set<T>) {
//         super(items);

//         this.add = undefined;
//         this.delete = undefined;
//         this.clear = undefined;
//     }
// }
