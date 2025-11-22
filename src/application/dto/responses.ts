export type ServiceResponse<T = unknown> = {
  success: boolean;
  codError: string;
  messageError: string;
  data: T;
};

export const buildSuccessResponse = <T>(data: T, message = 'Operación exitosa'): ServiceResponse<T> => ({
  success: true,
  codError: '00',
  messageError: message,
  data,
});

export const buildErrorResponse = (codError: string, messageError: string): ServiceResponse<null> => ({
  success: false,
  codError,
  messageError,
  data: null,
});
