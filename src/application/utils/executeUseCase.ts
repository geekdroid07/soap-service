import { ApplicationError } from '../errors/ApplicationError';
import { buildErrorResponse } from '../dto/responses';
import { ERROR_CODES } from '../constants/errorCodes';

export const executeUseCase = async <Input, Output>(
  useCaseExecutor: (input: Input) => Promise<Output>,
  payload: Input,
) => {
  try {
    return await useCaseExecutor(payload);
  } catch (error) {
    if (error instanceof ApplicationError) {
      return buildErrorResponse(error.code, error.message);
    }

    return buildErrorResponse(
      ERROR_CODES.INTERNAL,
      error instanceof Error ? error.message : 'Error desconocido',
    );
  }
};
