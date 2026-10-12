import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema.js';
import { TasksGateway } from './tasks.gateway.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksGateway],
})
export class TasksModule {}
