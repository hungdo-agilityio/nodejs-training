import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';

interface CreatePaymentIntentRequest {
  serviceIds: string[];
  appointmentDate: string;
  appointmentTime: string;
}

interface CreatePaymentIntentResponseData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface CreatePaymentIntentResponse {
  data: CreatePaymentIntentResponseData;
}

type UseCreatePaymentIntentOptions = Omit<
  UseMutationOptions<
    CreatePaymentIntentResponseData,
    Error,
    CreatePaymentIntentRequest
  >,
  'mutationFn'
>;

export function useCreatePaymentIntent(
  options?: UseCreatePaymentIntentOptions
) {
  const { getToken } = useAuth();

  return useMutation({
    ...options,
    mutationFn: async (data: CreatePaymentIntentRequest) => {
      const response =
        await httpClient.post<CreatePaymentIntentResponse>(
          '/payments/create-intent',
          data,
          getToken
        );

      return response.data;
    },
  });
}
