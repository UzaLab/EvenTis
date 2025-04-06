import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min, IsDateString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer'; // Pour la transformation potentielle

export class CreateTicketTypeDto {
  @IsNotEmpty({ message: "Le nom du type de billet est requis." })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: "Le prix est requis (peut être 0)." })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Le prix doit être un nombre (ex: 1500.00 ou 0)." })
  @Min(0, { message: "Le prix ne peut pas être négatif." })
  @Type(() => Number) // Essaye de transformer la valeur en nombre si possible
  price: number;

  // La devise sera probablement gérée au niveau de l'événement ou globale plus tard, on garde XOF par défaut dans l'entité pour l'instant.
  // @IsOptional() @IsString() @Length(3, 3) currency?: string;

  @IsNotEmpty({ message: "La quantité disponible est requise." })
  @IsPositive({ message: "La quantité doit être un nombre entier positif." })
  @Min(1, { message: "La quantité doit être au moins 1." })
  @Type(() => Number)
  quantity_available: number;

  @IsOptional()
  @IsDateString({}, { message: "La date de début de vente doit être une date valide (format ISO 8601)." })
  sale_start_date?: string;

  @IsOptional()
  @IsDateString({}, { message: "La date de fin de vente doit être une date valide (format ISO 8601)." })
  sale_end_date?: string;
}