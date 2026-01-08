import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/generated/prisma/browser';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    // REGISTER
    async register(name: string, email: string, password: string): Promise<{ access_token: string; user: Partial<User> }> {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.usersService.createUser({ 
            name, 
            email, 
            password: hashedPassword, 
            googleId: null // Explicitly set to null for email/password users
        });

        // Generate JWT token
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        // Return token and user (without password)
        return {
            access_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
        };
    }

    // LOGIN
    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, name: user.name, email: user.email, picture: user.picture },
        };
    }
}
