import { BadRequestException, Injectable } from '@nestjs/common';
import { InstructorRepository } from './instructor.repository';
import { AUTH_MESSAGES, USER_MESSAGES } from 'src/shared/constants/messages';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class InstructorService {
  constructor(
    private instructorRepo: InstructorRepository,
    private userRepo: UserRepository,
  ) {}

  public async findMe(userId: string) {
    const instructor = await this.instructorRepo.findByUserId(userId);

    if (!instructor)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_INST);

    return { data: instructor };
  }

  public async deleteAccount(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.userRepo.softDelete(id);

    return { message: USER_MESSAGES.DELETE_SUCCESSFUL };
  }
}
