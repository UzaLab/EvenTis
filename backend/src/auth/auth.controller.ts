import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Import pour le garde Local

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  // ValidationPipe est global (main.ts), pas besoin de @UsePipes ici
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    // Si on arrive ici, LocalAuthGuard a exécuté LocalStrategy.validate() avec succès.
    // L'utilisateur retourné par validate() est attaché à req.user.
    return this.authService.login(req.user); // Utilise req.user fourni par le garde
  }

  @UseGuards(AuthGuard('jwt')) // Protège cette route avec la stratégie JWT
  @Get('me') // Route: GET /auth/me
  getProfile(@Request() req) {
    // JwtStrategy.validate a déjà validé le token et attaché le payload à req.user
    // Le payload contient { userId: number, email: string }
    return req.user;
  }
}