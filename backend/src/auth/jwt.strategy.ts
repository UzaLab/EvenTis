import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET non défini dans la configuration.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<any> {
    // payload = { email: user.email, sub: user.id } décodé depuis le JWT valide
    if (!payload || !payload.sub || !payload.email) {
         throw new UnauthorizedException('Token invalide ou payload manquant');
    }
    // Retourne les infos utilisateur qui seront attachées à req.user pour les routes protégées
    return { userId: payload.sub, email: payload.email };
  }
}