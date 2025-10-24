import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  name() {
    return 'Roshan';
  }
}
