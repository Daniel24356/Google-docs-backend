import { User } from "@prisma/client";
import { CreateUserDTO } from "../../dto/createUser.dto";
import { UserService } from "../../service/implementation/user-service";
import { CustomError } from "../../exceptions/error/customError.error";
import { db } from "../../configs/db";
import {comparePassword, hostPassword} from "../../utils/password.utils"
import { StatusCodes } from "http-status-codes";
import { ChangePasswordDTO } from "../../dto/resetPassword.auth.dto";
import ChangePassword from "../../Design/changeSucces";

export class UserServiceImpl implements UserService{
    
    async createUser(data: CreateUserDTO): Promise<User> {
        const isUserExist = await db.user.findFirst({
            where: {
                email: data.email,
            },
        });
        
        if(isUserExist){
            throw new CustomError(409, "Oops email already taken");
        }
        
        const user = await db.user.create({
            data: {
                email: data.email,
                password: await hostPassword(data.password),
                name: data.name,
                role: data.role
            },
        })
        return user;
    }
    async getUserById(id: string): Promise<User | null>{
        const user = await db.user.findUnique({
            where:{
              id,
            }
        })
       if(!user){
           throw new  CustomError(404, `User with ${id} does not exist`)
       }
       return user
    }
    
    async getAllUsers(): Promise<User[]> {
        return await db.user.findMany();
    }
    async updateUser(id: string, data: Partial<CreateUserDTO>): Promise<User>{
        const isUserExist = await db.user.findFirst({
            where:{
                id,
            }
        });
        if(!isUserExist){
           throw new CustomError(404, `There is no user with id ${id}`)
        }
        const user = await db.user.update({
                where: {id},
                data,
            })
            return user;
    }

  async deleteUser(id: string): Promise<void>{
         await db.user.delete({
                where: {id},
            })
          
    }


}
