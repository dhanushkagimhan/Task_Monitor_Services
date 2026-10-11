import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/tasks.schema.js';
import { Model } from 'mongoose';

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

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
