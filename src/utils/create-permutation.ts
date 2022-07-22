export default function* createPermutation<T>(items: T[][]): Generator<T[]> {
    const remainder = items.length > 1 ? createPermutation(items.slice(1)) : [[]];
    for (const r of remainder) {
        for (const h of items.at(0) ?? []) {
            yield [h, ...r];
        }
    }
}
