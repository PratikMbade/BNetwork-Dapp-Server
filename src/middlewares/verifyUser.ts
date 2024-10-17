import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

interface JwtPayload extends Partial<User>{
    userId: number; 
    registered: boolean;
}



  
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided.", success: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded  as User; 
        if (!decoded.registered) {
            return res.status(403).json({ msg: "User is not registered.", success: false });
        }
        next();
    } catch (error) {
        return res.status(400).json({ msg: "Invalid token.", success: false });
    }
};
