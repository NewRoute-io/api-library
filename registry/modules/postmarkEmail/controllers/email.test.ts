import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ServerClient } from "postmark";

import { createEmailController } from "@/modules/postmarkEmail/controllers/email.js";
import { UserRepository } from "@/repositories/user.interface.js";

import {
  emailNotFound,
  postmarkSendError,
} from "@/modules/postmarkEmail/utils/errors/email.js";

vi.mock("postmark", () => {
  return {
    ServerClient: vi.fn().mockImplementation(() => ({
      sendEmailWithTemplate: vi.fn(),
      sendEmailBatchWithTemplates: vi.fn(),
    })),
  };
});

const pmClient = new ServerClient("xxxx-xxxxx-xxxx-xxxxx-xxxxxx");

describe("postmark-email API Module tests", () => {
  describe("Email Controller Tests", () => {
    let controller: ReturnType<typeof createEmailController>;
    let userRepositoryMock: Partial<UserRepository>;

    type MockPayload = {
      name: string;
      foo: string;
    };

    const mockUser = { id: 123, email: "mock@mail.com" };
    const mockUsers = [
      { id: 123, email: "mock@mail.com" },
      { id: 567, email: "mock2@mail.com" },
    ];
    const mockTemplateName = "exampleTemplate";
    const mockPayload = { name: "Bob", foo: "bar" };

    beforeEach(() => {
      userRepositoryMock = { getUserById: vi.fn() };

      // Injecting the mocked repositories into the controller
      controller = createEmailController(
        userRepositoryMock as UserRepository,
        pmClient
      );
    });

    it("should send and email", async () => {
      (userRepositoryMock.getUserById as Mock).mockResolvedValue(mockUser);
      (pmClient.sendEmailWithTemplate as Mock).mockResolvedValue({});

      await controller.sendEmail<MockPayload>({
        receiverId: mockUser.id,
        templateName: mockTemplateName,
        payload: mockPayload,
      });

      expect(pmClient.sendEmailWithTemplate).toHaveBeenCalledWith({
        From: "no-reply@sender.com",
        To: mockUser.email,
        TemplateAlias: mockTemplateName,
        TemplateModel: mockPayload,
        TrackOpens: true,
      });
    });

    it("should throw emailNotFound during single send if user doesn't have email", async () => {
      (userRepositoryMock.getUserById as Mock).mockResolvedValue({
        email: undefined,
      });

      await expect(
        controller.sendEmail<MockPayload>({
          receiverId: mockUser.id,
          templateName: mockTemplateName,
          payload: mockPayload,
        })
      ).rejects.toThrowError(emailNotFound());

      expect(pmClient.sendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should throw postmarkSendError during single send if there is a problem with Postmark SDK", async () => {
      const mockErr = { message: "mock msg" };
      (userRepositoryMock.getUserById as Mock).mockResolvedValue(mockUser);
      (pmClient.sendEmailWithTemplate as Mock).mockRejectedValue(mockErr);

      await expect(
        controller.sendEmail<MockPayload>({
          receiverId: mockUser.id,
          templateName: mockTemplateName,
          payload: mockPayload,
        })
      ).rejects.toThrowError(postmarkSendError(mockErr.message));
    });

    it("should send bulk emails", async () => {
      const mockReceivers = mockUsers.map((el) => el.id);

      (userRepositoryMock.getUserById as Mock)
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);
      (pmClient.sendEmailBatchWithTemplates as Mock).mockResolvedValue({});

      await controller.sendBulkEmails<MockPayload>({
        receiverIds: mockReceivers,
        templateName: mockTemplateName,
        payload: mockPayload,
      });

      expect(pmClient.sendEmailBatchWithTemplates).toHaveBeenCalledWith([
        {
          From: "no-reply@sender.com",
          To: mockUsers[0].email,
          TemplateAlias: mockTemplateName,
          TemplateModel: mockPayload,
          TrackOpens: true,
        },
        {
          From: "no-reply@sender.com",
          To: mockUsers[1].email,
          TemplateAlias: mockTemplateName,
          TemplateModel: mockPayload,
          TrackOpens: true,
        },
      ]);
    });

    it("should silently ignore users with no email and send bul emails", async () => {
      const mockNoEmailUser = { id: 987 };
      const mockReceivers = [...mockUsers, mockNoEmailUser].map((el) => el.id);

      (userRepositoryMock.getUserById as Mock)
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1])
        .mockResolvedValueOnce(mockNoEmailUser);
      (pmClient.sendEmailBatchWithTemplates as Mock).mockResolvedValue({});

      await controller.sendBulkEmails<MockPayload>({
        receiverIds: mockReceivers,
        templateName: mockTemplateName,
        payload: mockPayload,
      });

      expect(pmClient.sendEmailBatchWithTemplates).toHaveBeenCalledWith([
        {
          From: "no-reply@sender.com",
          To: mockUsers[0].email,
          TemplateAlias: mockTemplateName,
          TemplateModel: mockPayload,
          TrackOpens: true,
        },
        {
          From: "no-reply@sender.com",
          To: mockUsers[1].email,
          TemplateAlias: mockTemplateName,
          TemplateModel: mockPayload,
          TrackOpens: true,
        },
      ]);
    });

    it("should throw postmarkSendError during bulk send if there is a problem with Postmark SDK", async () => {
      const mockErr = { message: "mock msg" };
      const mockReceivers = mockUsers.map((el) => el.id);

      (userRepositoryMock.getUserById as Mock)
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);
      (pmClient.sendEmailBatchWithTemplates as Mock).mockRejectedValue(mockErr);

      await expect(
        controller.sendBulkEmails<MockPayload>({
          receiverIds: mockReceivers,
          templateName: mockTemplateName,
          payload: mockPayload,
        })
      ).rejects.toThrowError(postmarkSendError(mockErr.message));
    });
  });
});
