import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import argon from 'argon2'; 

import { createAuthBasicController } from "@/modules/auth-basic/controllers/authBasic.js";

import { UserRepository, User } from "@/repositories/user.interface.js";
import { BasicAuthSchema } from "@/schemaValidators/auth-basic.interface.js";

import { usernameNotAvailable, invalidLoginCredentials } from "@/modules/auth-basic/utils/errors/auth.js";

vi.mock('argon2');

describe("auth-basic API Module tests", () => {
  describe("AuthBasic Controller Tests", () => {
    let controller: ReturnType<typeof createAuthBasicController>;
    let userRepositoryMock: Partial<UserRepository>; // Mock the UserRepository interface

    const mockUser: User = {
      userId: "1",
      username: "testUser",
      password: "hashedPassword",
      createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
      userRepositoryMock = {
        getUser: vi.fn(),
        createAuthBasicUser: vi.fn(),
      };

      // Injecting the mocked repository into the controller
      controller = createAuthBasicController(
        userRepositoryMock as UserRepository
      );
    });

    it("should throw usernameNotAvailable when user exists on signup", async () => {
      const signupData: BasicAuthSchema = {
        username: mockUser.username,
        password: mockUser.password,
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);

      await expect(controller.signup(signupData)).rejects.toThrowError(usernameNotAvailable());
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(signupData.username);
    });

    it("should create a new user on signup", async () => {
      const signupData: BasicAuthSchema = {
        username: "newUser",
        password: "123",
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(null);
      (argon.hash as Mock).mockResolvedValue("hashedPass");
      (userRepositoryMock.createAuthBasicUser as Mock).mockResolvedValue(signupData);

      const result = await controller.signup(signupData);

      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(signupData.username);
      expect(userRepositoryMock.createAuthBasicUser).toHaveBeenCalledWith({
        username: signupData.username,
        hashedPass: "hashedPass",
      });

      expect(result.user).toEqual(signupData);
    });

    it('should throw invalidLoginCredentials when logging in with wrong username', async () => {
      const loginData: BasicAuthSchema = {
        username: "newUser",
        password: "123",
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(null);

      await expect(controller.login(loginData)).rejects.toThrowError(invalidLoginCredentials());
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(loginData.username);
    });

    it('should throw invalidLoginCredentials when logging in with correct username and wrong password', async () => {
      const loginData: BasicAuthSchema = {
        username: mockUser.username,
        password: "123",
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);
      (argon.verify as Mock).mockResolvedValue(false);

      await expect(controller.login(loginData)).rejects.toThrowError(invalidLoginCredentials());
      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(loginData.username);
      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, loginData.password);
    });

    it('should login with correct credentials', async () => {
      const loginData: BasicAuthSchema = {
        username: mockUser.username,
        password: mockUser.password,
      };

      (userRepositoryMock.getUser as Mock).mockResolvedValue(mockUser);
      (argon.verify as Mock).mockResolvedValue(true);

      const result = await controller.login(loginData)

      expect(userRepositoryMock.getUser).toHaveBeenCalledWith(loginData.username);
      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, loginData.password);

      expect(result.user).toEqual(mockUser);
    });
  });
});
