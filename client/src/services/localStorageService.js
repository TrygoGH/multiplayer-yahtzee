import Result, { tryCatch } from "../utils/Result";

export const KEYS = {
    authData: "authData",
};

export function getItemUnsafe(key){
    const isValidKeyResult = isValidKey(key);
    if(isValidKeyResult.isFailure()) return isValidKeyResult;

    const item = localStorage.getItem(key);
    return Result.success(item);
}

export function getItem(key){
    const isValidKeyResult = isValidKey(key);
    if(isValidKeyResult.isFailure()) return isValidKeyResult;

    const item = localStorage.getItem(key);
    if(!item) return Result.failure(`Item from key ${key} is not a valid object.`);

    return Result.success(item);
}

export function removeItem(key){
    const isValidKeyResult = isValidKey(key);
    if(isValidKeyResult.isFailure()) return isValidKeyResult;

    localStorage.removeItem(key);
    const item = localStorage.getItem(key);
    if(item) return Result.failure(`Item from key ${key} has not been removed successfully.`);

    return Result.success(`Item from key ${key} has been removed successfully.`);
}

export function isValidKey(key){
    const hasKey = Object.hasOwn(KEYS, key); 
    return hasKey 
    ? Result.success(true)
    : Result.failure(`Session does or should not contain key ${key}.`);
}

export function hasKey(key){
    const getItemResult = getItem(key);
    if(getItemResult.isFailure()) return getItemResult;

    return Result.success(true);
}

export function setItem(key, value){
    const isValidKeyResult = isValidKey(key);
    if(isValidKeyResult.isFailure()) return isValidKeyResult;

    const setItemResult = tryCatch(() => {
        localStorage.setItem(key, value)
    });
    if(setItemResult.isFailure()) return Result.failure(`Error: ${setItemResult.error}`);

    const itemResult = getItemUnsafe(key);
    if(itemResult.isFailure()) return itemResult;
    
    const item = itemResult.unwrap();
    if(item !== value) return Result.failure("Failed to set key.");

    return Result.success(`Set item successful for kvp: ${key} ${value}.`);
}

