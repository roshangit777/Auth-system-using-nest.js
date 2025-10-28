import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const email = ((await req.body?.email) as string) || 'anonymous';
    return `login-${email}`;
  }
  // set limit to 5 attempts
  protected getLimit(): Promise<number> {
    return Promise.resolve(5);
  }
  //time window time of 1 min
  protected getTtl(): Promise<number> {
    return Promise.resolve(6000);
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many attempts. Please try again after 1 minute',
    );
  }
}
