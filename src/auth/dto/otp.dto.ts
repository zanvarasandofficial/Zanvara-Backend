import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RequestOtpDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
