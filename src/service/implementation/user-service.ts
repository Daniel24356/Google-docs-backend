 
   import { User } from "@prisma/client";
   import { CreateUserDTO } from "../../dto/createUser.dto";
import { ChangePasswordDTO } from "../../dto/resetPassword.auth.dto";

   export interface UserService {
       createUser(data: CreateUserDTO): Promise<User>;
       getUserById(id: string): Promise<User | null>;
       getAllUsers(): Promise<User[]>;
       updateUser(id: string, data: Partial<CreateUserDTO>): Promise<User>;
       deleteUser(id: string): Promise<void>;
}
    //    addUser(id: number): Promise<void>
   