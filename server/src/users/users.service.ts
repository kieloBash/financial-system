import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async createUser(data: {
        name: string;
        email: string;
        password: string;
        googleId?: string | null;
    }): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async getUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    // Find user by email (for login)
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    // Find user by ID
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    // Get all users (for admin)
    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    // Update user (example)
    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return this.prisma.user.update({ where: { id }, data });
    }

    // Delete user (example)
    async deleteUser(id: string): Promise<User> {
        return this.prisma.user.delete({ where: { id } });
    }
}
