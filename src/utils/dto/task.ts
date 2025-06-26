import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

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
  @IsString()
  userId: string;
}

// UpdateTaskDto: all fields optional for PATCH/PUT
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsIn(['none', 'daily', 'weekly', 'custom'])
  recurrenceType?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}