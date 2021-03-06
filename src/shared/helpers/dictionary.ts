import {Utilities, PlaygroundError} from '../helpers';

export interface IDictionary<T> {
    [index: string]: T
}

export class Dictionary<T> {
    constructor(protected items?: IDictionary<T>) {
        if (Utilities.isNull(this.items)) this.items = {};
    }

    get(key: string): T {
        if (!this.contains(key)) {
            throw new PlaygroundError('Key not found.');
        }
        return this.items[key];
    }

    add(key: string, value: T): T {
        if (this.contains(key)) throw new PlaygroundError('Key already exists.');
        return this.insert(key, value);
    };

    first() {
        if (Utilities.isNull(this.items)) throw new Error('Dictionary isn\'t initialized. Call \'new\' first.');
        var key = this.keys()[0];
        if (!Utilities.isNull(key)) return this.items[key];
    }

    insert(key: string, value: T): T {
        if (Utilities.isNull(this.items)) throw new Error('Dictionary isn\'t initialized. Call \'new\' first.');
        this.items[key] = value;
        return value;
    }

    remove(key: string): T {
        if (!this.contains(key)) throw new PlaygroundError('Key not found.');
        var value = this.items[key];
        delete this.items[key];
        return value;
    };

    clear() {
        this.items = {};
    }

    contains(key: string): boolean {
        if (key == null) throw new PlaygroundError('Key cannot be null or undefined');
        if (Utilities.isNull(this.items)) throw new Error('Dictionary isn\'t initialized. Call \'new\' first.');
        return this.items.hasOwnProperty(key);
    }

    keys(): string[] {
        if (Utilities.isNull(this.items)) throw new Error('Dictionary isn\'t initialized. Call \'new\' first.');
        return _.keys(this.items);
    }

    values(): T[] {
        if (Utilities.isNull(this.items)) throw new Error('Dictionary isn\'t initialized. Call \'new\' first.');
        return _.values(this.items);
    }

    lookup(): IDictionary<T> {
        return this.keys().length ? this.items : null;
    }

    get count(): number {
        return this.values().length;
    };
}