import { User } from "@prisma/client";
import { CreateUserDTO } from "../dto/createUser.dto";
import { loginDTO } from "../dto/login.dto";



export interface AuthService {
    login(data: loginDTO): Promise<{accessToken:string; refreshToken: string}>
    createUser(data: CreateUserDTO): Promise<User>;
}