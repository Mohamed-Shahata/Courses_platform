import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ROLE } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { UserService } from './user.service';

@Controller('admin')
export class AdminUserController {
  constructor(private userService: UserService) {}

  // GET ~/admin/user/students
  @Get('user/students')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all students (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all students' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public getAllStudents() {
    return this.userService.getAllStudent();
  }

  // GET ~/admin/user/instructors
  @Get('user/instructors')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all instructors (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all instructors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public getAllCourses() {
    return this.userService.getAllInst();
  }
}
