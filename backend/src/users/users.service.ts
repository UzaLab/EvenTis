import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Méthode pour créer un utilisateur
  async create(userData: Partial<User>): Promise<User> {
    // Le hashage du mot de passe sera géré par AuthService avant d'appeler ceci
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  // Méthode pour trouver un utilisateur par son ID
  async findOneById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  // Méthode pour trouver un utilisateur par son Email
  // Sélectionne explicitement password_hash car AuthService en a besoin
  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash') // Assure que le hash est sélectionné
      .where('user.email = :email', { email })
      .getOne();
    return user;
  }
}