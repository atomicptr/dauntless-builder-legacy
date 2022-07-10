const sortObjectByKeys = <T extends object>(data: T): T => {
    const newObject: T = {} as T;

    Object.keys(data).sort().forEach(key => {
        newObject[key as keyof typeof newObject] = data[key as keyof typeof data];
    });

    return newObject;
}

export default sortObjectByKeys;
