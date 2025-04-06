import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: "L'email est requis." })
  @IsEmail({}, { message: "L'adresse email fournie n'est pas valide." })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  @IsString()
  password: string;
}