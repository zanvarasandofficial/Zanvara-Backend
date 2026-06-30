import { IsIn } from 'class-validator';

export class UpdateNotificationStatusDto {
  @IsIn(['NEW', 'READ'])
  status!: 'NEW' | 'READ';
}
