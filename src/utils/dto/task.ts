import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsIn, IsNumber, Min, ValidateIf, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsIn(['low', 'medium', 'high'])
  priority: string;

  @IsOptional()
  @IsIn(['none', 'daily', 'weekly', 'custom'])
  recurrenceType?: string;

  @IsOptional()
  @IsString()
  userId: string; // This resolves the userId validation error
}


export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
