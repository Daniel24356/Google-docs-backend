import { Response, Request, NextFunction } from "express";
import { UserServiceImpl } from "../service/implementation/user-service.implementation";
import { CreateUserDTO } from "../dto/createUser.dto";
import { CustomRequest } from "../Middleware/auth.middleware";
import { StatusCodes } from "http-status-codes";
import { ChangePasswordDTO } from "../dto/resetPassword.auth.dto";


export class UserController {
    private userService: UserServiceImpl;
     
    constructor() {
        this.userService = new UserServiceImpl();
    }

    public createUser = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try{
            const userData = req.body as CreateUserDTO;
            const newUser = await this.userService.createUser(userData);
            res.status(201).json(newUser);
        }catch (error){
            next(error);
        }
    }
    
    public getUserById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | any> => {
        try{
            const userId = req.params.id;
            const user = await this.userService.getUserById(userId)
            if(!user){
               return res.status(404).json({message: "User not found"});
            }
            res.status(200).json(user);
        } catch(error){
            next(error)
        }
    };

    public getAllUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | any> => {
        try{
            const user = await this.userService.getAllUsers();
            res.status(200).json(user)
        } catch(error){
            next(error)
        }
    };

    public updateUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ):Promise<void | any> => {
        try{
            const userId = req.params.id;
            const userData = req.body as Partial<CreateUserDTO>
            const updateUser = await this.userService.updateUser(userId,userData)
            res.status(200).json(updateUser);
        } catch(error){
            next(error)
        }
    };

    public deleteUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ):Promise<void | any> => {
        try{
            const userId = req.params.id;
            const deleteUser = await this.userService.deleteUser(userId)
            res.status(200).json(deleteUser);
        } catch(error){
            next(error)
        }
    };
       
}