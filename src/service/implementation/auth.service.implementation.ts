import { User } from "@prisma/client";
import { db } from "../../configs/db";
import { loginDTO } from "../../dto/login.dto";
import { CustomError } from "../../exceptions/error/customError.error";
import { comparePassword, hostPassword } from "../../utils/password.utils";
import { AuthService } from "../auth.service";
import jwt from "jsonwebtoken"

export class AuthServiceImp implements AuthService {
    async login(data: loginDTO): Promise<{ accessToken: string; refreshToken: string; }> {

        const isUserExist = await db.user.findUnique({
            where: {
                email: data.email
            },
        })

        if (!isUserExist) {
            throw new CustomError(401, "Invalid password or email");
        }

        const isPasswordValid = await comparePassword(data.password, isUserExist.password || '')
        if (!isPasswordValid) {
            throw new CustomError(401, "invalid password or email");
        }

        const fullname = isUserExist.name
        const accessToken = this.generateAcessToken(isUserExist.id, fullname, isUserExist.role);

        const refreshToken = this.generateRefreshToken(
            isUserExist.id,
            fullname,
            isUserExist.role
        );

        return { accessToken, refreshToken };
    }

     
    generateAcessToken(userId: string, name: string, role: string): string {
        return jwt.sign({ id: userId, name: role }, process.env.JWT_SECRET || '', {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        })
    }

    generateRefreshToken(userId: string, name: string, role: string): string {
        return jwt.sign({ id: userId, name: role }, process.env.JWT_SECRET || '', {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
        })
    }

    generateOtpExpiration() {
        return new Date(Date.now() + 10 * 60 * 1000)
    }

}