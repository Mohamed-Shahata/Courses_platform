import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: DataBaseService) {}

  findByName(name: string) {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }
}
