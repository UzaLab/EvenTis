import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsDateString, IsInt, Min, IsUrl, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTypeEnum } from '../entities/event.entity'; // Importer l'enum depuis l'entité
import { CreateTicketTypeDto } from '../../tickets/dto/create-ticket-type.dto'; // Importer le DTO pour les ticket types

export class CreateEventDto {
  @IsNotEmpty({ message: "Le titre de l'événement est requis." })
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: "Le type d'événement est requis." })
  @IsEnum(EventTypeEnum, { message: "Le type d'événement doit être 'physical', 'online', ou 'hybrid'." })
  event_type: EventTypeEnum;

  @IsNotEmpty({ message: "La date de début est requise." })
  @IsDateString({}, { message: "La date de début doit être une date valide (format ISO 8601)." })
  start_date: string; // Utiliser string pour l'API, sera converti en Date

  @IsNotEmpty({ message: "La date de fin est requise." })
  @IsDateString({}, { message: "La date de fin doit être une date valide (format ISO 8601)." })
  end_date: string; // Utiliser string pour l'API

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  location_address?: string;

  @IsOptional()
  @IsUrl({}, { message: "L'URL de l'événement en ligne doit être une URL valide." })
  location_url?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity?: number;

  @IsOptional()
  @IsUrl({}, { message: "L'URL de l'image de couverture doit être une URL valide." })
  cover_image_url?: string;

  // Optionnel: Permettre de créer les types de billets en même temps que l'événement
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // Valide chaque objet dans le tableau
  @Type(() => CreateTicketTypeDto) // Nécessaire pour que la validation imbriquée fonctionne
  ticket_types?: CreateTicketTypeDto[];
}