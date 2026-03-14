import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../DB/database.service';
import { AUTH_MESSAGES, USER_MESSAGE } from 'src/shared/constants/messages';
import { updateWebhookDTO } from './dto/updateWebhook.dto';

@Injectable()
export class UserService {
  constructor(private prisma: DataBaseService) {}

  public async getProfile(id: string) {
    const merchant = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        business_name: true,
        wallet_balance: true,
        currency: true,
        webhook_url: true,
        status: true,
      },
    });

    if (!merchant)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return {
      data: merchant,
    };
  }

  public async updateWebhood(id: string, dto: updateWebhookDTO) {
    const merchant = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!merchant)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const { webhook_url } = dto;

    await this.prisma.user.update({
      where: { id },
      data: {
        webhook_url,
      },
    });

    return {
      message: USER_MESSAGE.CHANGE_WEBHOOD_URL_SUCCESSFUL,
    };
  }
}
