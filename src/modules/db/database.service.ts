import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

/**
 * Database service that extends `PrismaClient` and manages the connection lifecycle.
 *
 * Uses the Prisma PostgreSQL adapter (`@prisma/adapter-pg`) for the underlying
 * database connection. The connection string is read from the `DATABASE_URL`
 * environment variable.
 *
 * This service is provided by `DataBaseModule` and exported for use across all
 * feature modules. It should be injected wherever direct database access is needed.
 *
 * @implements {OnModuleInit} - Connects to the database when the module initializes.
 * @implements {OnModuleDestroy} - Disconnects cleanly when the application shuts down.
 *
 * @example
 * // Injecting in a service
 * constructor(private prisma: DataBaseService) {}
 *
 * const user = await this.prisma.user.findUnique({ where: { id } });
 */
@Injectable()
export class DataBaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    super({ adapter });
  }

  /**
   * Establishes the database connection when the NestJS module is initialized.
   *
   * Called automatically by the NestJS lifecycle — do not call manually.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('DB connected successfully');
  }

  /**
   * Closes the database connection gracefully when the application shuts down.
   *
   * Called automatically by the NestJS lifecycle — do not call manually.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('DB disconnected');
  }
}
