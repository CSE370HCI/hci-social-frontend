export function removeEmptyParams(obj: Record<string, unknown>) {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] === Object(obj[key])) {
            const subObj = removeEmptyParams(obj[key] as Record<string, unknown>);
            if (Object.keys(subObj).length > 0) newObj[key] = subObj;
        } else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
}