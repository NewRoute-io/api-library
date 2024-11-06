import { ServerClient, TemplatedMessage } from "postmark";

import { UserRepository } from "@/repositories/user.interface.js";

import {
  SendEmail,
  SendBulkEmails,
} from "@/schemaValidators/email.interface.js";

// NOTE: Update "from email"
const FROM_EMAIL = "no-reply@sender.com";

interface EmailController {
  sendEmail: (props: SendEmail) => void;
  sendBulkEmails: (props: SendBulkEmails) => void;
}

export const createEmailController = (
  pm: ServerClient,
  userRepository: UserRepository
): EmailController => {
  return {
    async sendEmail({ receiverId, templateName, payload }) {
      const user = await userRepository.getUserById(receiverId);

      if (user?.email) {
        const message: TemplatedMessage = {
          From: FROM_EMAIL,
          To: user.email,
          TemplateAlias: templateName,
          TemplateModel: payload,
          TrackOpens: true,
        };

        await pm.sendEmailWithTemplate(message).catch((err) => {
          // TODO: throw error that there was a problem with postmark
        });
      } else {
        // TODO: Email missing error
      }
    },

    async sendBulkEmails({ receiverIds, templateName, payload }) {
      // TODO: Add pagination as postmark supports max 500 emails per batch
      const usersPromises = receiverIds.map(async (id) => {
        return await userRepository.getUserById(id);
      });

      const users = await Promise.all(usersPromises);

      const messages: TemplatedMessage[] = users
        .filter((el) => el && el.email) // Ignore users who don't have an email so we don't interrupt bulk send
        .map((user) => {
          return {
            From: FROM_EMAIL,
            To: user!.email,
            TemplateAlias: templateName,
            TemplateModel: payload,
            TrackOpens: true,
          };
        });

      await pm.sendEmailBatchWithTemplates(messages).catch((err) => {
        // TODO: throw error that there was a problem with postmark
      });
    },
  };
};
