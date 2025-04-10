import { Role } from "@prisma/client";
import {IsEmail, IsEnum, IsNotEmpty, IsOptional, Length} from "class-validator"

export class CreateUserDTO {
    @IsNotEmpty()
    @Length(2, 50)
    name!: string;
     
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @Length(6, 20)
    password!: string;

    role!: Role
}