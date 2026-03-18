import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @Roles(ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public getProfile(@CurrentUser() payload: JwtPayloadType) {
    return this.userService.getProfile(payload.id);
  }
}
