export interface TokenNotificationService {
  notifyPaymentToken(email: string, token: string): Promise<void>;
}
