import { BadRequestException, Injectable } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { AUTH_MESSAGES, USER_MESSAGES } from 'src/shared/constants/messages';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class StudentService {
  constructor(
    private studentRepo: StudentRepository,
    private userRepo: UserRepository,
  ) {}

  public async findMe(userId: string) {
    const student = await this.studentRepo.findStudentByUserId(userId);

    if (!student)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_STUDENT);

    return { data: student };
  }

  public async deleteAccount(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.userRepo.softDelete(id);

    return { message: USER_MESSAGES.DELETE_SUCCESSFUL };
  }
}
