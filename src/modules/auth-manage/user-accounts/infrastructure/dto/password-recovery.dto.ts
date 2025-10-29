export class FindByRecoveryCodeDto {
  recoveryCode: string;
}

export class UpdatePasswordRecoveryDto {
  userId: string;
  recoveryCode: string;
  expirationDate: Date;
}

export class ConfirmPasswordRecoveryDto {
  userId: string;
}
