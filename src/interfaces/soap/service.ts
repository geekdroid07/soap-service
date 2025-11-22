import {
  createWalletUseCases,
  type WalletUseCases,
} from '../../application/factories/createWalletUseCases';
import { executeUseCase } from '../../application/utils/executeUseCase';
import { RegisterClientInput } from '../../application/use-cases/RegisterClientUseCase';
import { RechargeWalletInput } from '../../application/use-cases/RechargeWalletUseCase';
import { InitiatePaymentInput } from '../../application/use-cases/InitiatePaymentUseCase';
import { ConfirmPaymentInput } from '../../application/use-cases/ConfirmPaymentUseCase';
import { GetWalletBalanceInput } from '../../application/use-cases/GetWalletBalanceUseCase';
import { logger } from '../../infrastructure/utils/logger';

type HandlerArgs<T> = T extends object ? T : never;

const wrapResponse = async <Input>(
  methodName: string,
  payload: Input,
  executor: (input: Input) => Promise<unknown>,
) => {
  logger.info(`SOAP ${methodName} invoked`, payload);
  return executeUseCase(executor, payload);
};

export const getSoapServiceDefinition = async (providedUseCases?: WalletUseCases) => {
  const useCases = providedUseCases ?? (await createWalletUseCases());

  return {
    WalletService: {
      WalletPort: {
        RegisterClient: async (args: HandlerArgs<{ RegisterClientRequest: RegisterClientInput }>) => ({
          RegisterClientResult: await wrapResponse(
            'RegisterClient',
            args.RegisterClientRequest,
            useCases.registerClient.execute.bind(useCases.registerClient),
          ),
        }),
        RechargeWallet: async (args: HandlerArgs<{ RechargeWalletRequest: RechargeWalletInput }>) => ({
          RechargeWalletResult: await wrapResponse(
            'RechargeWallet',
            args.RechargeWalletRequest,
            useCases.rechargeWallet.execute.bind(useCases.rechargeWallet),
          ),
        }),
        InitiatePayment: async (args: HandlerArgs<{ InitiatePaymentRequest: InitiatePaymentInput }>) => ({
          InitiatePaymentResult: await wrapResponse(
            'InitiatePayment',
            args.InitiatePaymentRequest,
            useCases.initiatePayment.execute.bind(useCases.initiatePayment),
          ),
        }),
        ConfirmPayment: async (args: HandlerArgs<{ ConfirmPaymentRequest: ConfirmPaymentInput }>) => ({
          ConfirmPaymentResult: await wrapResponse(
            'ConfirmPayment',
            args.ConfirmPaymentRequest,
            useCases.confirmPayment.execute.bind(useCases.confirmPayment),
          ),
        }),
        GetWalletBalance: async (
          args: HandlerArgs<{ GetWalletBalanceRequest: GetWalletBalanceInput }>,
        ) => ({
          GetWalletBalanceResult: await wrapResponse(
            'GetWalletBalance',
            args.GetWalletBalanceRequest,
            useCases.getWalletBalance.execute.bind(useCases.getWalletBalance),
          ),
        }),
      },
    },
  };
};
