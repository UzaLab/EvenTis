import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  @IsString()
  @MaxLength(100)
  first_name: string;

  @IsNotEmpty({ message: 'Le nom de famille est requis.' })
  @IsString()
  @MaxLength(100)
  last_name: string;

  @IsNotEmpty({ message: "L'email est requis." })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  @MaxLength(255)
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;
}