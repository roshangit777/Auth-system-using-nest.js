jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { LoginHistory } from 'src/events/entity/login-history.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEventsService } from 'src/events/user-event.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  // mocks
  let userRepository: any;
  let loginHistoryRepository: any;
  let jwtService: any;
  let userEventService: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    loginHistoryRepository = {
      find: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    userEventService = {
      emitUserRegistered: jest.fn(),
      recordLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Users), useValue: userRepository },
        {
          provide: getRepositoryToken(LoginHistory),
          useValue: loginHistoryRepository,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: UserEventsService, useValue: userEventService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //User Registration
  describe('userRegister', () => {
    it('throws ConflictException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'r5@gmail.com',
      });

      await expect(
        service.userRegister({
          email: 'r5@gmail.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      /* jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpass'); */
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass'); // ✅ use this instead of jest.spyOn

      const userData = {
        name: 'roshan',
        email: 'roshan@gmail.com',
        password: 'password',
        role: 'user',
      };

      const createdUser = {
        id: 1,
        ...userData,
      };
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);

      const res = await service.userRegister({
        name: 'roshan',
        email: 'roshan@gmail.com',
        password: 'password',
      } as any);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(userEventService.emitUserRegistered).toHaveBeenCalledWith(
        createdUser,
      );
      expect(res).toHaveProperty('message', 'Register is completed');
      expect(res.user).not.toHaveProperty('password');
    });
  });

  //User login
  describe('loginUser', () => {
    it('throws UnauthorizedException when email not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.loginUser({
          email: 'r@gmial.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password not match', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'r@gmial.com',
        password: 'password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); //use this instead of jest.spyOn

      await expect(
        service.loginUser({
          email: 'r@gmial.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
    it('Returns token and user on successfully login', async () => {
      const user = {
        id: 2,
        email: 'r@gmail.com',
        name: 'Roshan',
        role: 'user',
        password: 'password',
      };
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); //use this instead of jest.spyOn
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const res = await service.loginUser({
        email: 'r@gmail.com',
        password: 'password',
      } as any);

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(userEventService.recordLogin).toHaveBeenCalledWith(user.id);
      expect(res).toEqual({
        access_token: 'jwt-token',
        user: expect.objectContaining({
          id: 2,
          email: 'r@gmail.com',
          name: 'Roshan',
          role: 'user',
        }),
      });
    });
  });

  describe('adminRegister', () => {
    it('thorws ConflictException when adminemail already exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'admin1@gmail.com',
        password: 'password',
        role: 'admin',
        name: 'Roshan',
      });

      await expect(
        service.adminRegister({
          email: 'admin1@gmail.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('Admin Registered successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass'); // ✅ use this instead of jest.spyOn

      const adminData = {
        name: 'roshan',
        email: 'admin1@gmail.com',
        role: 'admin',
        password: 'hashedpass',
      };

      userRepository.create.mockReturnValue(adminData);
      userRepository.save.mockReturnValue(adminData);

      const res = await service.adminRegister({
        name: 'roshan',
        email: 'admin1@gmail.com',
        password: 'password',
      } as any);

      expect(userRepository.create).toHaveBeenCalledWith(adminData);
      expect(userRepository.save).toHaveBeenCalledWith(adminData);
      expect(res).toHaveProperty('message', 'Register is completed');
      expect(res.user).not.toHaveProperty('password');
    });
  });

  describe('adminLogin', () => {
    it('throws UnauthorizedException when email not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.loginAdmin({
          email: 'admin1@gamil.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password not match', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Roshan',
        email: 'admin1@gamil.com',
        password: 'password',
        role: 'admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); //use this instead of jest.spyOn

      await expect(
        service.loginAdmin({
          email: 'admin1@gamil.com',
          password: 'password2',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when role not match to admin', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Roshan',
        email: 'admin1@gamil.com',
        password: 'password',
        role: 'user',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); //use this instead of jest.spyOn

      await expect(
        service.loginAdmin({
          email: 'admin1@gamil.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Returns token and admin on successfully login', async () => {
      const admin = {
        id: 2,
        email: 'r@gmail.com',
        name: 'Roshan',
        role: 'admin',
        password: 'password',
      };

      userRepository.findOne.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const res = await service.loginAdmin({
        email: 'r@gmail.com',
        password: 'password',
      } as any);

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(userEventService.recordLogin).toHaveBeenCalledWith(admin.id);
      expect(res).toEqual({
        access_token: 'jwt-token',
        user: expect.objectContaining({
          id: 2,
          email: 'r@gmail.com',
          name: 'Roshan',
          role: 'admin',
        }),
      });
    });
  });

  describe('loginHistory', () => {
    it('Returns a array of objects containing history with user details if userId is not defined', async () => {
      const history = [
        {
          id: 1,
          user: {
            id: 8,
            name: 'Jhon',
            email: '123@gmail.com',
            password:
              '$2b$10$E30y1J.T5JG0aCo7segfu.UFRKTHwQkuuBlSapZswkVRPxvwdY0Ki',
            role: 'user',
            createdAt: '2025-10-27T23:10:44.683Z',
            updatedAt: '2025-10-27T23:10:44.683Z',
          },
          loginTime: '2025-10-29T00:38:43.202Z',
        },
        {
          id: 2,
          user: {
            id: 4,
            name: 'Roshan',
            email: 'r0@gmail.com',
            password:
              '$2b$10$yMk0lnY0MheuZGfqQYb.iO43//3VkYAMZgl6cr6FpN9gOaBjmx7ve',
            role: 'admin',
            createdAt: '2025-10-24T05:47:52.686Z',
            updatedAt: '2025-10-24T05:47:52.686Z',
          },
          loginTime: '2025-10-29T01:02:24.958Z',
        },
      ];

      loginHistoryRepository.find.mockResolvedValue(history);

      const res = await service.getUserLoginHistory();
      expect(res).toEqual(history);
    });

    it('Returns a array of strings containing history of the login user if userId provided', async () => {
      const history = [
        {
          id: 1,
          user: {
            id: 8,
            name: 'Jhon',
            email: '123@gmail.com',
            password:
              '$2b$10$E30y1J.T5JG0aCo7segfu.UFRKTHwQkuuBlSapZswkVRPxvwdY0Ki',
            role: 'user',
            createdAt: '2025-10-27T23:10:44.683Z',
            updatedAt: '2025-10-27T23:10:44.683Z',
          },
          loginTime: '2025-10-29T00:38:43.202Z',
        },
        {
          id: 2,
          user: {
            id: 8,
            name: 'Jhon',
            email: '123@gmail.com',
            password:
              '$2b$10$E30y1J.T5JG0aCo7segfu.UFRKTHwQkuuBlSapZswkVRPxvwdY0Ki',
            role: 'user',
            createdAt: '2025-10-27T23:10:44.683Z',
            updatedAt: '2025-10-27T23:10:44.683Z',
          },
          loginTime: '2025-10-30T00:38:43.202Z',
        },
        {
          id: 3,
          user: {
            id: 8,
            name: 'Jhon',
            email: '123@gmail.com',
            password:
              '$2b$10$E30y1J.T5JG0aCo7segfu.UFRKTHwQkuuBlSapZswkVRPxvwdY0Ki',
            role: 'user',
            createdAt: '2025-10-27T23:10:44.683Z',
            updatedAt: '2025-10-27T23:10:44.683Z',
          },
          loginTime: '2025-10-31T00:38:43.202Z',
        },
      ];

      loginHistoryRepository.find.mockResolvedValue(history);

      const res = await service.getUserLoginHistory(8);
      const historyArr = history.map((item) => item.loginTime);
      expect(loginHistoryRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 8 } },
        select: ['loginTime'],
      });
      expect(res).toEqual(historyArr);
    });
    it('Returns a empty array if userId not provided and if no login history found', async () => {
      loginHistoryRepository.find.mockResolvedValue([]);

      const res = await service.getUserLoginHistory();
      expect(res).toEqual([]);
    });

    it('throws NotFoundException userId provided and if no records available', async () => {
      loginHistoryRepository.find.mockResolvedValue(null);

      await expect(service.getUserLoginHistory(8)).rejects.toThrow(
        NotFoundException,
      );
      expect(loginHistoryRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 8 } },
        select: ['loginTime'],
      });
    });
  });
});
