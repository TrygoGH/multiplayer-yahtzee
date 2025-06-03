import Result from "../utils/Result";
import { KEYS as SESSION_KEYS, getItem, removeItem, setItem} from "./localStorageService";

export function getAuthData(){
    const getAuthDataResult = getItem(SESSION_KEYS.authData);
    if (getAuthDataResult.isFailure()) return Result.failure('User not logged in yet');

    const storedAuthData = getAuthDataResult.unwrap();
    const authData = JSON.parse(storedAuthData);
    return Result.success(authData);
}

export function getToken(){
    const getAuthDataResult = getItem(SESSION_KEYS.authData);
    if (getAuthDataResult.isFailure()) return Result.failure('User not logged in yet');

    const storedAuthData = getAuthDataResult.unwrap();
    const authData = JSON.parse(storedAuthData);
    const { token } = authData;
    if(!token) return Result.failure("Token not valid object.");

    return Result.success(token);
}

export function setAuthData(authData){
    const stringAuthData = JSON.stringify(authData);
    const setItemResult = setItem(SESSION_KEYS.authData, stringAuthData);
    return setItemResult;
}

export function hasLoggedIn(){
    const getAuthDataResult = getAuthData();
    return getAuthDataResult.isSuccess() 
    ? Result.success("User has logged in")
    : Result.success("User hasn't logged in");
}

export function logout(){
    return removeItem(SESSION_KEYS.authData); 
}

export function login(authData){
    return setAuthData(authData);
}