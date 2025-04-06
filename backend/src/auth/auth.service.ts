import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const { email, password, first_name, last_name } = createUserDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée.');
    }

    const saltRounds = 10;
    let hashedPassword: string;
    try {
        hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error("Erreur lors du hachage du mot de passe:", error);
        throw new InternalServerErrorException('Erreur lors de la création du compte (hash).');
    }

    try {
      const newUserPartial: Partial<User> = {
        first_name,
        last_name,
        email,
        password_hash: hashedPassword,
      };
      const createdUser = await this.usersService.create(newUserPartial);

      const { password_hash, ...result } = createdUser;
      return result;

    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur en BDD:", error);
      throw new InternalServerErrorException('Erreur lors de la création du compte (db).');
    }
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password_hash'> | null> {
    console.log(`--- validateUser: Tentative de validation pour email: ${email} ---`);

    const user = await this.usersService.findOneByEmail(email);

    console.log(`--- validateUser: Utilisateur trouvé par email:`, user ? `ID ${user.id}` : 'Non trouvé');
    if (user) {
      console.log(`--- validateUser: Hash trouvé en BDD? :`, user.password_hash ? 'Oui (caché)' : 'NON !');
    }

    if (user && user.password_hash) {
         console.log(`--- validateUser: Comparaison bcrypt en cours... ---`);
         const isMatch = await bcrypt.compare(pass, user.password_hash);
         console.log(`--- validateUser: Résultat bcrypt.compare: ${isMatch} ---`);

         if(isMatch) {
            const { password_hash, ...result } = user;
            console.log(`--- validateUser: Succès, retourne user ID ${result.id} ---`);
            return result;
         }
    }

    console.log(`--- validateUser: Échec (User non trouvé ou mdp incorrect) ---`);
    return null;
  }

  async login(user: Omit<User, 'password_hash'>): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}