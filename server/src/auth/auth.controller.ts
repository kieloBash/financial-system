import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(
            registerDto.name,
            registerDto.email,
            registerDto.password
        );
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
}
