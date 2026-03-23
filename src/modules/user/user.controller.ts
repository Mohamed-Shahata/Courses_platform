import {
  Body,
  Controller,
  Get,
  UseGuards,
  Patch,
  Delete,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateUserDTO } from './dto/updateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PRODUCTION, REFRESH_TOKEN } from 'src/shared/constants/variables';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private config: ConfigService,
  ) {}

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

  //Patch ~/user/update
  @Patch('update')
  @UseGuards(JwtAuthGuard)
  public updateProfile(
    @CurrentUser('id') id: string,
    @Body() body: updateUserDTO,
  ) {
    return this.userService.updateProfile(body, id);
  }

  // Delete ~/user/delete
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  public async deleteProfile(
    @CurrentUser('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const msg = await this.userService.deleteAccount(id);

    res.clearCookie(REFRESH_TOKEN, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') == PRODUCTION ? true : false,
      sameSite: 'strict',
    });

    return msg;
  }

  //Post ~/user/upload-profile
  @Post('upload-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  public uploadProfile(
    @CurrentUser('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.userService.uploadProfile(id, image.path);
  }
}
