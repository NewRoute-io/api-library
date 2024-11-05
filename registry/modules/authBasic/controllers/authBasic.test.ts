import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import argon from "argon2";

import { createAuthBasicController } from "@/modules/authBasic/controllers/authBasic.js";

import { UserRepository, User } from "@/repositories/user.interface.js";
import {
  RefreshTokenRepository,
  RefreshToken,
} from "@/repositories/refreshToken.interface.js";
import { BasicAuthSchema } from "@/schemaValidators/authBasic.interface.js";

import {
  usernameNotAvailable,
  invalidLoginCredentials,
} from "@/modules/authBasic/utils/errors/auth.js";
import { forbiddenError } from "@/modules/shared/utils/errors/common.js";

vi.mock("argon2");

describe("auth-basic API Module tests", () => {
  describe("AuthBasic Controller Tests", () => {
    let controller: ReturnType<typeof createAuthBasicController>;
    let userRepositoryMock: Partial<UserRepository>;
    let rtRepositoryMock: RefreshTokenRepository;

    const mockUser: User = {
      userId: 1,
      username: "testUser",
      password: "hashedPassword",
      createdAt: new Date().toISOString(),
    };

    const mockRefreshToken: RefreshToken = {
      userId: mockUser.userId,
      token: "1234",
      tokenFamily: "mockFamilyId",
      active: true,
      expiresAt: new Date(
        new Date().getTime() + 1 * 24 * 60 * 6000
      ).toISOString(),
    };

    const mockNewRefreshToken: RefreshToken = {
      ...mockRefreshToken,
      token: "567",
      expiresAt: new Date(
        new Date().getTime() + 31 * 24 * 60 * 6000
      ).toISOString(),
    };

    beforeEach(() => {
      userRepositoryMock = {
        getUser: vi.fn(),
        createAuthBasicUser: vi.fn(),
      };

      rtRepositoryMock = {
        getToken: vi.fn(),
        invalidateTokenFamily: vi.fn(),
        createToken: vi.fn(),
      };

      // Injecting the mocked repository into the controller
      controller = createAuthBasicController(
        userRepositoryMock as UserRepository,
        rtRepositoryMock
      );
    });

    it("should throw usernameNotAvailable when user exists on signup", async () => {
      const signupData: BasicAuthSchema = {
        username: mockUser.username,
        password: mockUser.password,
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);

      await expect(controller.signup(signupData)).rejects.toThrowError(
        usernameNotAvailable()
      );
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(
        signupData.username
      );
    });

    it("should create a new user on signup", async () => {
      const signupData: BasicAuthSchema = {
        username: "newUser",
        password: "123",
      };

      const mockNewUser = {
        userId: 123,
        ...signupData,
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(null);
      (argon.hash as Mock).mockResolvedValue("hashedPass");
      (userRepositoryMock.createAuthBasicUser as Mock).mockResolvedValue(
        mockNewUser
      );

      const result = await controller.signup(signupData);

      expect(rtRepositoryMock.createToken).toHaveBeenCalledOnce();
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(
        signupData.username
      );
      expect(userRepositoryMock.createAuthBasicUser).toHaveBeenCalledWith({
        username: signupData.username,
        hashedPass: "hashedPass",
      });

      expect(result.user).toEqual(mockNewUser);
    });

    it("should throw invalidLoginCredentials when logging in with wrong username", async () => {
      const loginData: BasicAuthSchema = {
        username: "newUser",
        password: "123",
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(null);

      await expect(controller.login(loginData)).rejects.toThrowError(
        invalidLoginCredentials()
      );
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(
        loginData.username
      );
    });

    it("should throw invalidLoginCredentials when logging in with correct username and wrong password", async () => {
      const loginData: BasicAuthSchema = {
        username: mockUser.username,
        password: "123",
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);
      (argon.verify as Mock).mockResolvedValue(false);

      await expect(controller.login(loginData)).rejects.toThrowError(
        invalidLoginCredentials()
      );
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(
        loginData.username
      );
      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        loginData.password
      );
    });

    it("should login with correct credentials", async () => {
      const loginData: BasicAuthSchema = {
        username: mockUser.username,
        password: mockUser.password,
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);
      (argon.verify as Mock).mockResolvedValue(true);

      const result = await controller.login(loginData);

      expect(rtRepositoryMock.createToken).toHaveBeenCalledOnce();
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(
        loginData.username
      );
      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        loginData.password
      );

      expect(result.user).toEqual(mockUser);
    });

    it("should refresh token", async () => {
      (rtRepositoryMock.getToken as Mock).mockResolvedValue(mockRefreshToken);
      (rtRepositoryMock.createToken as Mock).mockResolvedValue(mockNewRefreshToken);

      const result = await controller.refreshToken({ token: mockRefreshToken.token });

      expect(rtRepositoryMock.getToken).toHaveBeenCalledWith(mockRefreshToken.token);
      expect(result.refreshToken).toEqual(mockNewRefreshToken);
    });

    it("should throw forbiddenError if token not found or expired", async () => {
      (rtRepositoryMock.getToken as Mock).mockResolvedValue(null);

      await expect(
        controller.refreshToken({ token: mockRefreshToken.token })
      ).rejects.toThrowError(forbiddenError());

      expect(rtRepositoryMock.getToken).toHaveBeenCalledWith(mockRefreshToken.token);
    });

    it("should throw forbiddenError if token has been used", async () => {
      const mockExpiredRefreshToken = { ...mockRefreshToken, active: false };
      
      (rtRepositoryMock.getToken as Mock).mockResolvedValue(mockExpiredRefreshToken);

      await expect(
        controller.refreshToken({ token: mockRefreshToken.token })
      ).rejects.toThrowError(forbiddenError());

      expect(rtRepositoryMock.getToken).toHaveBeenCalledWith(mockRefreshToken.token);
    });
  });
});
