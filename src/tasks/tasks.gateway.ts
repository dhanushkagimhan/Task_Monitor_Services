import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-task')
  joinTask(
    @MessageBody() data: { taskId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`task:${data.taskId}`);

    client.emit('task:joined', {
      taskId: data.taskId,
    });
  }

  emitProgress(data: {
    taskId: string;
    status: string;
    progress: number;
    result: string | null;
  }) {
    this.server.to(`task:${data.taskId}`).emit('task:progress', data);
  }
}
