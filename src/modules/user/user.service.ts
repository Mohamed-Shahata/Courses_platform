import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { AUTH_MESSAGES, USER_MESSAGES } from 'src/shared/constants/messages';
import { ROLE } from 'generated/prisma/enums';
import { updateUserDTO } from './dto/updateUser.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { UserRepository } from './user.repository';

/**
 * Service responsible for user profile management operations.
 *
 * Handles reading, updating, deleting user accounts, and managing profile images.
 * Also exposes an internal `findUser` method used by guards for role-based access.
 *
 * @injectable
 */
@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Retrieves the public profile of a user by their ID.
   *
   * Returns a limited set of fields (id, name, email, phone, role)
   * without exposing sensitive data like password hash or tokens.
   *
   * @param id - The unique identifier of the user.
   * @returns An object containing the user's profile data.
   * @throws {BadRequestException} If no user is found with the given ID.
   */
  public async getProfile(id: string) {
    const user = await this.userRepo.findByIdSelect(id);

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return { data: user };
  }

  /**
   * Retrieves a list of all users with the `STUDENT` role.
   *
   * Intended for admin use only. Returns a safe selection of fields
   * without sensitive information.
   *
   * @returns An object containing an array of all student records.
   * @throws {BadRequestException} If no students are found.
   */
  public async getAllStudent() {
    const students = await this.userRepo.findByRole(ROLE.STUDENT);

    if (!students)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_STUDENT);

    return { data: students };
  }

  /**
   * Retrieves a list of all users with the `INSTRUCTOR` role.
   *
   * Intended for admin use only. Returns a safe selection of fields
   * without sensitive information.
   *
   * @returns An object containing an array of all instructor records.
   * @throws {BadRequestException} If no instructors are found.
   */
  public async getAllInst() {
    const inst = await this.userRepo.findByRole(ROLE.INSTRUCTOR);

    if (!inst) throw new BadRequestException(USER_MESSAGES.NOT_FOUND_INST);

    return { data: inst };
  }

  /**
   * Updates the profile information of the currently authenticated user.
   *
   * Only fields present in the DTO will be updated (partial update).
   *
   * @param dto - The fields to update on the user's profile.
   * @param id - The unique identifier of the user to update.
   * @returns An object containing the updated user record.
   * @throws {BadRequestException} If no user is found with the given ID.
   */
  public async updateProfile(dto: updateUserDTO, id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const newUser = await this.userRepo.updateProfile(id, dto);

    return { data: newUser };
  }

  /**
   * Finds a minimal user record by ID for use in guards and interceptors.
   *
   * Returns only `id` and `role` to keep lookups lightweight.
   * This method is exported and consumed by `AuthRoleGuard`.
   *
   * @param id - The unique identifier of the user.
   * @returns An object containing the user's `id` and `role`.
   * @throws {BadRequestException} If no user is found with the given ID.
   */
  public async findUser(id: string) {
    const user = await this.userRepo.findByIdForGuard(id);

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    return { data: user };
  }

  /**
   * Soft-deletes the currently authenticated user's account.
   *
   * Sets `isDelete` to `true`, records a `deleteAt` timestamp,
   * and clears the refresh token to invalidate active sessions.
   * The account can be restored later via `AuthService.restoreAccount`.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns A success message confirming the account was deleted.
   * @throws {BadRequestException} If no user is found with the given ID.
   */
  public async deleteAccount(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.userRepo.softDelete(id);

    return { message: USER_MESSAGES.DELETE_SUCCESSFUL };
  }

  /**
   * Uploads and sets a new profile image for the authenticated user.
   *
   * Stores the file path (as returned by Multer's disk storage) in the database.
   *
   * @param id - The unique identifier of the user.
   * @param profileImage - The file path of the uploaded profile image.
   * @returns A success message and the updated user record (id, name, email, profileImage).
   * @throws {BadRequestException} If no user is found with the given ID.
   */
  public async uploadProfile(id: string, profileImage: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const { url, publicId } =
      await this.cloudinaryService.uploadImageAndUpdate(profileImage);

    const updatedUser = await this.userRepo.updateProfileImage(
      id,
      url,
      publicId,
    );

    return {
      message: USER_MESSAGES.UPDATE_PROFILEIMAGE_SUCCESSFUL,
      data: updatedUser,
    };
  }
}
