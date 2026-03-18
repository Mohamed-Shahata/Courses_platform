import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { AUTH_MESSAGES, USER_MESSAGES } from 'src/shared/constants/messages';
import { ROLE } from 'generated/prisma/enums';
import { updateUserDTO } from './dto/updateUser.dto';

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

  public async getAllStudent() {
    const students = await this.prisma.user.findMany({
      where: { role: ROLE.STUDENT },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
    if (!students)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_STUDENT);

    return { data: students };
  }

  public async getAllInst() {
    const inst = await this.prisma.user.findMany({
      where: { role: ROLE.INSTRUCTOR },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
    if (!inst) throw new BadRequestException(USER_MESSAGES.NOT_FOUND_INST);

    return { data: inst };
  }

  public async updateProfile(dto: updateUserDTO, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const newUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    return { data: newUser };
  }

  public async findUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return {
      data: user,
    };
  }
}
