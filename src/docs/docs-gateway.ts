import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Status } from 'src/types/status.enum';

@WebSocketGateway(8002, {
  cors: {
    origin: 'http://localhost:5174',
  },
})
export class DocsGateWay {
  @WebSocketServer()
  server: Server;

  emitJobUpdate(docId: string, status: Status) {
    this.server.emit('job-update', { docId, status });
  }
}
