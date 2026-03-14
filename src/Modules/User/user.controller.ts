import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { updateWebhookDTO } from './dto/updateWebhook.dto';

@Controller('merchant')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  public getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch('webhook_url')
  @UseGuards(JwtAuthGuard)
  public updateWebhook(
    @CurrentUser('id') userId: string,
    @Body() body: updateWebhookDTO,
  ) {
    return this.userService.updateWebhood(userId, body);
  }
}
