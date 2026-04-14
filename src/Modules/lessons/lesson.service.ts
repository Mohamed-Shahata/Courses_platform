import { BadRequestException, Injectable } from '@nestjs/common';
import { addLessonDTO } from './dto/addLesson.dto';
import { LESSON_MESSAGE, SECTION_MESSAGE } from 'src/shared/constants/messages';
import { updateLessonDTO } from './dto/updateLesson.dto';
import { updateLessonStatus } from './dto/updateLessonStatus.dto';
import { LessonRepository } from './lesson.repository';
import { SectionRepository } from '../sections/section.repository';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

/**
 * Service responsible for managing lessons within courses.
 *
 * Handles creating, retrieving, updating, deleting lessons,
 * and allowing admins to change a lesson's publication status.
 * Lessons are always scoped to a parent course.
 *
 * @injectable
 */
@Injectable()
export class LessonService {
  constructor(
    private lessonRepo: LessonRepository,
    private sectionRepo: SectionRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Creates a new lesson under a specific course.
   *
   * - Verifies the course exists and belongs to the requesting instructor.
   * - Stores the uploaded video file path returned by Multer.
   *
   * @param dto - DTO containing the lesson `title` and `order`.
   * @param instId - The ID of the instructor creating the lesson (ownership check).
   * @param courseId - The ID of the course to attach the lesson to.
   * @param videoUrl - The file path of the uploaded video (from Multer disk storage).
   * @returns An object containing the newly created lesson record.
   * @throws {BadRequestException} If the course is not found or does not belong to the instructor.
   */
  public async createLesson(
    dto: addLessonDTO,
    userId: string,
    videoUrl: string,
    sectionId: string,
  ) {
    const section = await this.sectionRepo.findByIdUser(sectionId, userId);
    if (!section)
      throw new BadRequestException(SECTION_MESSAGE.NOT_FOUND_SECTION);

    const { title, order } = dto;

    const { url, publicId } =
      await this.cloudinaryService.uploadVideo(videoUrl);

    const lesson = await this.lessonRepo.create({
      title,
      videoUrl: url,
      videoPublicId: publicId,
      order,
      section: {
        connect: {
          id: sectionId,
        },
      },
    });

    return { data: lesson };
  }

  /**
   * Retrieves all lessons belonging to a specific section.
   *
   * @param courseId - The unique identifier of the section.
   * @returns An object containing an array of lesson records for the section.
   * @throws {BadRequestException} If the section is not found.
   */
  public async getAlllessonWithSection(sectionId: string) {
    const section = await this.sectionRepo.find(sectionId);
    if (!section)
      throw new BadRequestException(SECTION_MESSAGE.NOT_FOUND_SECTION);

    const lessons = await this.lessonRepo.findAllWithSection(sectionId);

    return { data: lessons };
  }

  /**
   * Retrieves a single lesson by its unique ID.
   *
   * @param id - The unique identifier of the lesson.
   * @returns An object containing the lesson record.
   * @throws {BadRequestException} If no lesson is found with the given ID.
   */
  public async getLessonById(id: string) {
    const lesson = await this.lessonRepo.findById(id);
    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    return { data: lesson };
  }

  /**
   * Updates the details of an existing lesson.
   *
   * Only the fields provided in the DTO will be updated (partial update).
   *
   * @param dto - DTO containing the fields to update (e.g. title, order).
   * @param id - The unique identifier of the lesson to update.
   * @returns An object containing the updated lesson record.
   * @throws {BadRequestException} If no lesson is found with the given ID.
   */
  public async updateLesson(dto: updateLessonDTO, id: string, userId: string) {
    const Nlesson = await this.lessonRepo.update(dto, id, userId);

    if (!Nlesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    return { data: Nlesson };
  }

  /**
   * Permanently deletes a lesson from the database.
   *
   * @param id - The unique identifier of the lesson to delete.
   * @returns A success message confirming deletion.
   * @throws {BadRequestException} If no lesson is found with the given ID.
   */
  public async deleteLesson(id: string, userId: string) {
    const lesson = await this.lessonRepo.findById(id);
    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    await this.lessonRepo.delete(id, userId);

    return { message: LESSON_MESSAGE.DELETE_SUCCESSFUL };
  }

  /**
   * Updates the publication status of a lesson (admin-only operation).
   *
   * Allows admins to publish, unpublish, or flag a lesson
   * without modifying its content.
   *
   * @param lessonId - The unique identifier of the lesson.
   * @param dto - DTO containing the new `status` value.
   * @returns An object containing the updated lesson record.
   * @throws {BadRequestException} If no lesson is found with the given ID.
   */
  public async updateLessonStatus(lessonId: string, dto: updateLessonStatus) {
    const lesson = await this.lessonRepo.updateStatus(dto, lessonId);

    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    return { data: lesson };
  }
}
