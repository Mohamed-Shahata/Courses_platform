import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('instructor')
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  //Get ~/instructor/me
  @Get('me')
  @Roles(RoleUser.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth('access-token')
  public async getMe(@CurrentUser('id') id: string) {
    return this.instructorService.findMe(id);
  }

  // Delete ~/instructor/delete
  @Delete('delete')
  @Roles(RoleUser.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth('access-token')
  public async sofyDelete(@CurrentUser('id') id: string) {
    return this.instructorService.deleteAccount(id);
  }
}
