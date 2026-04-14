import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NOTIFICATION_TYPE } from '../../../../generated/prisma/enums';

export class CreateNotificationDTO {
  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: NOTIFICATION_TYPE,
    description: 'The type/category of the notification',
    example: NOTIFICATION_TYPE.ENROLLMENT,
  })
  @IsEnum(NOTIFICATION_TYPE)
  @IsNotEmpty()
  type: NOTIFICATION_TYPE;

  @ApiProperty({
    description: 'Short notification title',
    example: 'You enrolled in NestJS Masterclass',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Full notification body/message',
    example: 'Your enrollment in NestJS Masterclass has been confirmed.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Optional deep-link URL inside the app',
    example: '/courses/abc123',
  })
  @IsString()
  @IsOptional()
  link?: string;
}
