import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROLE } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { UserService } from './user.service';

@ApiTags('Admin - Users')
@Roles(ROLE.ADMIN)
@UseGuards(AuthRoleGuard)
@Controller('admin')
export class AdminUserController {
  constructor(private userService: UserService) {}

  // GET ~/admin/user/all
  @Get('user/all')
  @ApiOperation({ summary: 'Get all users regardless of role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public getAllUsers() {
    return this.userService.getAllUsers();
  }

  // GET ~/admin/user/students
  @Get('user/students')
  @ApiOperation({ summary: 'Get all students (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all students' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public getAllStudents() {
    return this.userService.getAllStudent();
  }

  // GET ~/admin/user/instructors
  @Get('user/instructors')
  @ApiOperation({ summary: 'Get all instructors (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all instructors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public getAllInstructors() {
    return this.userService.getAllInst();
  }

  // PATCH ~/admin/user/:id/ban
  @Patch('user/:id/ban')
  @ApiOperation({ summary: 'Ban a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the user to ban' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 400, description: 'User not found or already banned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Cannot ban an admin account' })
  public banUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.banUser(id);
  }

  // PATCH ~/admin/user/:id/unban
  @Patch('user/:id/unban')
  @ApiOperation({ summary: 'Unban a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the user to unban' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 400, description: 'User not found or not banned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public unbanUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.unbanUser(id);
  }
}
