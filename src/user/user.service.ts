import { Injectable } from '@nestjs/common';

type User = {
  id: number;
  name: string;
};

@Injectable()
export class UserService {
  getAllUsers(): User[] {
    return [
      {
        id: 1,
        name: 'Raj',
      },
      {
        id: 2,
        name: 'Ram',
      },
      {
        id: 3,
        name: 'Ravi',
      },
    ];
  }

  getOneUser(id: number) {
    const user: User | undefined = this.getAllUsers().find(
      (item) => item.id == id,
    );
    return user;
  }

  welcomeUser(id: number) {
    const user: User | undefined = this.getOneUser(id);
    if (!user) {
      return { error: 'User not found' };
    }
    return `Welcome ${user.name}`;
  }
}
