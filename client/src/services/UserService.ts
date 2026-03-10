import $api from "../http";
import { IUser } from "../models/IUser";

export default class UserService{
    static fetchUsers() {
        return $api.get<IUser[]>('/users')
    }
}

