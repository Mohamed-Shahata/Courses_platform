import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ROLE } from 'generated/prisma/enums';
import { updateUserDTO } from './dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  //Get ~/user/profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  public getProfile(@CurrentUser('id') id: string) {
    return this.userService.getProfile(id);
  }

  //Get ~/user/students
  @Get('students')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  public getAllStudents() {
    return this.userService.getAllStudent();
  }

  //Get ~/user/instructors
  @Get('instructors')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  public getAllCourses() {
    return this.userService.getAllInst();
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  public updateProfile(
    @CurrentUser('id') id: string,
    @Body() body: updateUserDTO,
  ) {
    return this.userService.updateProfile(body, id);
  }
}
