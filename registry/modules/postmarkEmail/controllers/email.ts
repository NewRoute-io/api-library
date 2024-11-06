import { ServerClient, TemplatedMessage } from "postmark";

import { UserRepository } from "@/repositories/user.interface.js";

import {
  emailNotFound,
  postmarkSendError,
} from "@/modules/postmarkEmail/utils/errors/email.js";

const POSTMARK__SERVER_TOKEN = process.env.POSTMARK__SERVER_TOKEN as string;
const pmClient = new ServerClient(POSTMARK__SERVER_TOKEN);

// NOTE: Replace with your email address
const FROM_EMAIL = "no-reply@sender.com";

/**
 * If you wish to have different payload for each receiver use this type:
 *
 * ```
 * type SendBulkEmails<T> = {
 *  templateName: string;
 *  payload: Omit<SendEmail<T>, "templateName">[];
 * };
 * ```
 *
 * **NOTE**: You will need to modify the controller logic to process the `payload` array correctly
 */
type SendBulkEmails<T> = {
  receiverIds: number[];
  templateName: string;
  payload: T;
};

type SendEmail<T> = {
  receiverId: number;
  templateName: string;
  payload: T;
};

interface EmailController {
  sendEmail: <T extends object>(props: SendEmail<T>) => void;
  sendBulkEmails: <T extends object>(props: SendBulkEmails<T>) => void;
}

export const createEmailController = (
  userRepository: UserRepository,
  pm: ServerClient = pmClient
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
          throw postmarkSendError(err?.message);
        });
      } else {
        throw emailNotFound();
      }
    },

    async sendBulkEmails({ receiverIds, templateName, payload }) {
      const usersPromises = receiverIds.map((id) => userRepository.getUserById(id));
      const users = await Promise.all(usersPromises);

      // Ignore users who don't have an email so we don't interrupt the bulk send
      const usersWithEmail = users.filter((user) => user?.email);

      // Paginate users as postmark supports max 500 emails per batch
      const userChunks = [];
      for (let i = 0; i < usersWithEmail.length; i += 500) {
        const chunk = usersWithEmail.slice(i, i + 500);
        userChunks.push(chunk);
      }

      const bulkSendPromises = userChunks.map(async (userChunk) => {
        const messages: TemplatedMessage[] = userChunk.map((user) => {
          return {
            From: FROM_EMAIL,
            To: user!.email,
            TemplateAlias: templateName,
            TemplateModel: payload,
            TrackOpens: true,
          };
        });

        await pm.sendEmailBatchWithTemplates(messages).catch((err) => {
          throw postmarkSendError(err?.message);
        });
      });

      await Promise.all(bulkSendPromises);
    },
  };
};
