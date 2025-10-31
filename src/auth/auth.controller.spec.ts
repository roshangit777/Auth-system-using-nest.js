import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

// 1️⃣ Mock your AuthService
const mockAuthService = {
  userRegister: jest.fn(),
  loginUser: jest.fn(),
  adminRegister: jest.fn(),
  loginAdmin: jest.fn(),
  getUserLoginHistory: jest.fn(),
};

// 2️⃣ Mock all guards so they don’t execute real logic
const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .overrideGuard(LoginThrottlerGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should register user successfully', async () => {
    const dto = { name: 'Roshan', email: 'r@gamil.com', password: 'password' };
    const result = {
      message: 'Register is completed',
      user: {
        id: 1,
        name: 'Roshan',
        email: 'r8@gmail.com',
        role: 'user',
        createdAt: '2025-10-31T03:39:37.880Z',
        updatedAt: '2025-10-31T03:39:37.880Z',
      },
    };

    jest.spyOn(service, 'userRegister').mockResolvedValue(result);
    const res = await controller.registerUser(dto);

    expect(service.userRegister).toHaveBeenCalledWith(dto);
    expect(res).toEqual(result);
  });

  it('Should login user successfully', async () => {
    const dto = { email: 'r@gamil.com', password: 'password' };
    const result = {
      access_token: 'jwt-token',
      user: {
        id: 1,
        name: 'Roshan',
        email: 'r8@gmail.com',
        role: 'user',
        createdAt: '2025-10-31T03:39:37.880Z',
        updatedAt: '2025-10-31T03:39:37.880Z',
      },
    };

    jest.spyOn(service, 'loginUser').mockResolvedValue(result);
    const res = await controller.userLogin(dto);

    expect(service.loginUser).toHaveBeenCalledWith(dto);
    expect(res).toEqual(result);
  });

  it('Should return loggerd in user successfully from the token', async () => {
    const dto = { sub: 8, email: '123@gmail.com', role: 'user' };
    const result = {
      id: 8,
      email: '123@gmail.com',
      role: 'user',
    };

    const res = await controller.getProfile(dto);
    expect(res).toEqual(result);
  });

  it('Should register admin successfully', async () => {
    const dto = { name: 'Roshan', email: 'r@gamil.com', password: 'password' };
    const result = {
      message: 'Register is completed',
      user: {
        id: 13,
        name: 'Roshan',
        email: 'r@gamil.com',
        role: 'admin',
        createdAt: '2025-10-31T04:06:49.011Z',
        updatedAt: '2025-10-31T04:06:49.011Z',
      },
    };

    jest.spyOn(service, 'adminRegister').mockResolvedValue(result);
    const res = await controller.createAdmin(dto);

    expect(service.adminRegister).toHaveBeenCalledWith(dto);
    expect(res).toEqual(result);
  });

  it('Should login admin successfully', async () => {
    const dto = { email: 'r@gamil.com', password: 'password' };
    const result = {
      access_token: 'jwt-token',
      user: {
        id: 1,
        name: 'Roshan',
        email: 'r@gmail.com',
        role: 'admin',
        createdAt: '2025-10-31T03:39:37.880Z',
        updatedAt: '2025-10-31T03:39:37.880Z',
      },
    };

    jest.spyOn(service, 'loginAdmin').mockResolvedValue(result);
    const res = await controller.adminLogin(dto);

    expect(service.loginAdmin).toHaveBeenCalledWith(dto);
    expect(res).toEqual(result);
  });

  it('Should Returns a array of object containing history of the login user if userId did not provided', async () => {
    const result = [
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

    jest.spyOn(service, 'getUserLoginHistory').mockResolvedValue(result);
    const res = await controller.getAllUserLoginHistory(undefined);

    expect(service.getUserLoginHistory).toHaveBeenCalledWith(undefined);
    expect(res).toEqual(result);
  });

  it('Should Returns a array of strings containing history of the login user if userId provided', async () => {
    const result = [
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

    const historyArr = result.map((item) => item.loginTime);
    jest.spyOn(service, 'getUserLoginHistory').mockResolvedValue(historyArr);
    const res = await controller.getAllUserLoginHistory(8);

    expect(service.getUserLoginHistory).toHaveBeenCalledWith(8);
    expect(res).toEqual(historyArr);
  });
});
