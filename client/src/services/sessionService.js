import Result from "../utils/Result";

export const KEYS = {
    authData: "authData",
};

export function getItemUnsafe(key){
    const hasKeyResult = isValidKey(key);
    if(hasKeyResult.isFailure()) return hasKeyResult;

    const item = sessionStorage.getItem(key);
    return Result.success(item);
}

export function getItem(key){
    const hasKeyResult = isValidKey(key);
    if(hasKeyResult.isFailure()) return hasKeyResult;

    const item = sessionStorage.getItem(key);
    if(!item) return Result.failure(`Item from key ${key} is not a valid object`);

    return Result.success(item);
}

export function removeItem(key){
    const hasKeyResult = isValidKey(key);
    if(hasKeyResult.isFailure()) return hasKeyResult;

    const item = sessionStorage.getItem(key);
    if(!item) return Result.failure(`Item from key ${key} is not a valid object`);

    return Result.success(item);
}

export function isValidKey(key){
    const hasKey = Object.hasOwn(KEYS, key); 
    return hasKey 
    ? Result.success(true)
    : Result.failure(`Session does or should not contain key ${key}`);
}

export function hasKey(key){
    const getItemResult = getItem(key);
    if(getItemResult.isFailure()) return getItemResult;

    return Result.success(true);
}

