import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    providers: [UsersService, PrismaService],
    controllers: [UsersController],
    exports: [UsersService], // export so AuthModule can use UsersService
})
export class UsersModule { }
