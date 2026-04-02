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
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateUserDTO } from './dto/updateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PRODUCTION, REFRESH_TOKEN } from 'src/shared/constants/variables';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private config: ConfigService,
  ) {}

  // GET ~/user/profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getProfile(@CurrentUser('id') id: string) {
    return this.userService.getProfile(id);
  }

  // PATCH ~/user/update
  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public updateProfile(
    @CurrentUser('id') id: string,
    @Body() body: updateUserDTO,
  ) {
    return this.userService.updateProfile(body, id);
  }

  // DELETE ~/user/delete
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  // POST ~/user/upload-profile
  @Post('upload-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public uploadProfile(
    @CurrentUser('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.userService.uploadProfile(id, image.path);
  }
}
