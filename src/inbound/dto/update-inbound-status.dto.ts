import { IsIn } from 'class-validator';

export class UpdateInboundStatusDto {
  @IsIn(['NEW', 'READ'])
  status!: 'NEW' | 'READ';
}
