import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/tasks.schema.js';
import { isValidObjectId, Model } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<TaskDocument>,
  ) {}

  create(createTask: CreateTaskDto) {
    return this.taskModel.create(createTask);
  }

  findAll() {
    return this.taskModel.find().exec();
  }

  findOne(id: string) {
    this.validateId(id);

    const task = this.taskModel.findById(id).exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    this.validateId(id);

    const task = this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true, runValidators: true })
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  remove(id: string) {
    this.validateId(id);

    const task = this.taskModel.findByIdAndDelete(id).exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return {
      message: `Task with ID ${id} has been deleted`,
    };
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid task ID');
    }
  }
}
