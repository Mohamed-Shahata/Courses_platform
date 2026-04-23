import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';

export class SelectRoleDto {
  @ApiProperty({ example: 'STUDENT', description: 'User role' })
  @IsString({ message: 'Please provide a valid role' })
  @IsNotEmpty({ message: 'Role cannot be empty' })
  role: RoleUser;
}
