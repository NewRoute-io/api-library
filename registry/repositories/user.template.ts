/**
 * HOW TO USE THIS TEMPLATE: 
 * 
 * Use this User Repository template file to integrate any database engine. 
 * 
 * Replace the `REPLACE:` comments with your query logic and return the correct types defined in user.interface.ts
 * 
 * Once you complete your implementation you don't have to do anything else as 
 * this repository is referenced in the rest of the code base and used to implement the service logic.
 */

import {
  UserRepository,
  User,
  AuthBasicSignup,
} from "@/repositories/user.interface.js";

export const createUserRepository = (): UserRepository => {
  return {
    async getUser(username: string): Promise<User | null> {
      // REPLACE: Implement user retrieval with your DB of choice

      return null;
    },

    async getUserById(userId: string): Promise<User | null> {
      // REPLACE: Implement user retrieval by ID with your DB of choice

      return null;
    },

    async createAuthBasicUser(data: AuthBasicSignup): Promise<User> {
      // REPLACE: Implement user creation with your DB of choice

      return {} as User; // REPLACE: Replace with user object from DB, implemented like this so it doesn't throw type error
    },
  };
}
