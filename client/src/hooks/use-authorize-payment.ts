import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';

interface AuthorizePaymentRequest {
  bookingId: string;
  idempotencyKey: string;
}

interface AuthorizePaymentResponse {
  data: {
    clientSecret: string;
    amount: number;
    currency: string;
  };
}

type UseAuthorizePaymentOptions = Omit<
  UseMutationOptions<
    AuthorizePaymentResponse['data'],
    Error,
    AuthorizePaymentRequest
  >,
  'mutationFn'
>;

export function useAuthorizePayment(options?: UseAuthorizePaymentOptions) {
  const { getToken } = useAuth();

  return useMutation({
    ...options,
    mutationFn: async (data: AuthorizePaymentRequest) => {
      const response = await httpClient.post<AuthorizePaymentResponse>(
        '/payments/authorize',
        data,
        getToken
      );

      return response.data;
    },
  });
}
