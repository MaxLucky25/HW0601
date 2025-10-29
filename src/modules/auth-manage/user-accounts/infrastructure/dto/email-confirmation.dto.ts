export class CreateEmailConfirmationDto {
  userId: string;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class FindByConfirmationCodeDto {
  confirmationCode: string;
}

export class UpdateEmailConfirmationDto {
  userId: string;
  confirmationCode: string;
  expirationDate: Date;
}

export class ConfirmEmailConfirmationDto {
  userId: string;
}
