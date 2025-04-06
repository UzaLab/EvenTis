import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [], // Vide pour l'instant
  providers: [UsersService],   // Service ajouté
  exports: [UsersService],     // Service exporté pour être utilisé par d'autres modules
})
export class UsersModule {}