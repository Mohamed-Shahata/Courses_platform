import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { AUTH_MESSAGES } from 'src/shared/constants/messages';

@Injectable()
export class UserService {
  constructor(private prisma: DataBaseService) {}

  public async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return {
      data: user,
    };
  }

  public async findUser(id: string) {
    const merchant = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!merchant)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return {
      data: merchant,
    };
  }
}
