import { BadRequestException, Injectable } from '@nestjs/common';
import { SectionRepository } from './section.repository';
import { CourseRepository } from '../course/course.repository';
import { addSectionDTO } from './dto/create.dto';
import { COURSE_MESSAGE, SECTION_MESSAGE } from 'src/shared/constants/messages';
import { updateSectionDTO } from './dto/update.dto';
import { LessonRepository } from '../lessons/lesson.repository';
import { LessonProgressRepository } from '../lessons/lessonProgress.repository';

@Injectable()
export class SectionService {
  constructor(
    private sectionRepo: SectionRepository,
    private courseRepo: CourseRepository,
    private lessonRepo: LessonRepository,
    private lessonProgressRepo: LessonProgressRepository,
  ) {}

  public async createSection(
    dto: addSectionDTO,
    courseId: string,
    userId: string,
  ) {
    const course = await this.courseRepo.findByIdAndUser(courseId, userId);

    if (!course) throw new BadRequestException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const { title, order } = dto;
    const section = await this.sectionRepo.create({
      title,
      order,
      course: { connect: { id: courseId } },
    });

    return { data: section };
  }

  public async getSectionsWithCourse(courseId: string) {
    const sections = await this.sectionRepo.findByIdCourse(courseId);

    return { data: sections };
  }

  public async updateSection(
    dto: updateSectionDTO,
    id: string,
    userId: string,
  ) {
    const section = await this.sectionRepo.update(dto, id, userId);

    if (!section)
      throw new BadRequestException(SECTION_MESSAGE.NOT_FOUND_SECTION);

    return { data: section };
  }

  public async deleteSection(id: string, userId: string) {
    const section = await this.sectionRepo.findByIdUser(id, userId);

    if (!section)
      throw new BadRequestException(SECTION_MESSAGE.NOT_FOUND_SECTION);

    await this.sectionRepo.delete(id, userId);
    return { message: SECTION_MESSAGE.DELETE_SECTION };
  }

  public async getSectionProgress(courseId: string, userId: string) {
    const totalLesson = await this.lessonRepo.countWithCourseId(courseId);

    const completeLesson =
      await this.lessonProgressRepo.countWithStudIdAndsectionId(
        userId,
        courseId,
      );

    const progress =
      totalLesson === 0 ? 0 : (completeLesson / totalLesson) * 100;

    return {
      data: {
        totalLesson,
        completeLesson,
        progress: Math.round(progress),
      },
    };
  }
}
