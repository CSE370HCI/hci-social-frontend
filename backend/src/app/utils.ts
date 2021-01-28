export function removeUndefined(obj: Record<string, unknown>) {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] === Object(obj[key])) {
            newObj[key] = removeUndefined(obj[key] as Record<string, unknown>);
        } else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
}