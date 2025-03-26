import { NextFunction, Request, Response } from "express";
import { AuthServiceImp } from "../service/implementation/auth.service.implementation";
import { CustomError } from "../exceptions/error/customError.error";
import { loginDTO } from "../dto/login.dto";
import { CreateUserDTO } from "../dto/createUser.dto";



export class AuthController {
  private authService: AuthServiceImp;

  constructor(){
    this.authService = new AuthServiceImp();
  }

  public login = async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try{
    const data: loginDTO = req.body
    const {accessToken, refreshToken} = await this.authService.login(data);
    res.status(200).json({accessToken, refreshToken});   
   }catch(error){
      next(error)
    }
  }

 
}