import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/tasks.schema.js';
import { isValidObjectId, Model } from 'mongoose';
import { TasksGateway } from './tasks.gateway.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly tasksGateway: TasksGateway,
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

  async processTask(id: string) {
    this.validateId(id);

    const task = await this.taskModel.findById(id).exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status === TaskStatus.PROCESSING) {
      throw new ConflictException('Task is already processing');
    }

    task.status = TaskStatus.PROCESSING;
    task.progress = 0;
    task.result = null;
    await task.save();

    this.emitTaskUpdate(task);

    // Run in the background; don't make the HTTP request
    // wait for the entire simulated job.
    void this.runFakeProcessing(id);

    return {
      message: 'Task processing started',
      taskId: id,
    };
  }

  private async runFakeProcessing(id: string) {
    try {
      for (let progress = 10; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 700));

        const task = await this.taskModel
          .findByIdAndUpdate(
            id,
            {
              progress,
              ...(progress === 100
                ? {
                    status: TaskStatus.COMPLETED,
                    result: 'Task processed successfully!',
                  }
                : {}),
            },
            { new: true },
          )
          .exec();

        if (!task) return;

        this.emitTaskUpdate(task);
      }
    } catch {
      const task = await this.taskModel
        .findByIdAndUpdate(id, { status: TaskStatus.FAILED }, { new: true })
        .exec();

      if (task) this.emitTaskUpdate(task);
    }
  }

  private emitTaskUpdate(task: TaskDocument) {
    this.tasksGateway.emitProgress({
      taskId: task._id.toString(),
      status: task.status,
      progress: task.progress,
      result: task.result,
    });
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid task ID');
    }
  }
}
