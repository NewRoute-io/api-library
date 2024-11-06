export type SendEmail = {
  receiverId: number;
  templateName: string;
  payload: object;
};

/**
 * If you wish to have different payload for each receiver use this type:
 *
 * ```
 * type SendBulkEmails = {
 *  templateName: string;
 *  payload: Omit<SendEmail, "templateName">[];
 * };
 * ```
 *
 * NOTE: You will need to modify the controller logic to process the `payload` array correctly
 */
export type SendBulkEmails = {
  receiverIds: number[];
  templateName: string;
  payload: object;
};

export interface EmailValidator {
  validateSendEmail: (sendEmailPayload: SendEmail) => Promise<SendEmail>;

  validateBulkEmail: (bulkEmailPayload: SendEmail) => Promise<SendBulkEmails>;
}
