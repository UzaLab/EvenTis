import { IsInt, IsPositive } from 'class-validator';

export class PurchaseTicketDto {
  @IsInt({ message: "L'ID du type de billet doit être un entier." })
  @IsPositive({ message: "L'ID du type de billet doit être un nombre positif." })
  ticketTypeId: number;
}