import Result from "../utils/Result";
import { KEYS as SESSION_KEYS, getItem, removeItem} from "./sessionService";

export function getAuthData(){
    const getAuthDataResult = getItem(SESSION_KEYS.authData);
    if (getAuthDataResult.isFailure()) return new Result.failure('User not logged in yet');

    const storedAuthData = getAuthDataResult.unwrap();
    const authData = JSON.parse(storedAuthData);
    return Result.success(authData);
}

export function hasLoggedIn(){
    const getAuthDataResult = getAuthData();
    return getAuthDataResult.isSuccess() 
    ? Result.success("User has logged in")
    : Result.success("User hasn't logged in");
}

export function logout(){
    removeItem(SESSIONSTORAGEKEYS.authData);
    return Result.success(true);
}