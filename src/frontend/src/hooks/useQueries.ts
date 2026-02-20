import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedActor } from './useAuthenticatedActor';
import type { CreateCustomerRequest, UpdateCustomerRequest, SaleItem as BackendSaleItem, PaymentMethod as BackendPaymentMethod, OpenRegisterRequest, CloseRegisterRequest } from '../backend';
import { 
  mapCustomerToFrontend, 
  mapSaleToFrontend, 
  mapCashRegisterSessionToFrontend,
  mapClosingRecordToFrontend,
  brlToCents,
  mapPaymentMethodToBackend,
  mapSaleItemsToBackend
} from '../backend/mappers';
import type { Customer, SaleItem as FrontendSaleItem, PaymentMethod as FrontendPaymentMethod } from '../types/domain';

// Customer queries
export function useListCustomers() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const customers = await actor.listCustomers();
      return customers.map(mapCustomerToFrontend);
    },
    enabled: isReady,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useGetCustomer(id: string) {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const customer = await actor.getCustomer(id);
      return mapCustomerToFrontend(customer);
    },
    enabled: isReady && !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCustomer() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCustomerRequest) => {
      if (!actor) throw new Error('Not authenticated');
      const customer = await actor.createCustomer(request);
      return mapCustomerToFrontend(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateCustomerRequest) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.updateCustomer(request);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
}

// Sales queries
export function useListSales() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const sales = await actor.listSales();
      return sales.map(mapSaleToFrontend);
    },
    enabled: isReady,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useListSalesByCustomer(customerId: string) {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['sales', 'customer', customerId],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const sales = await actor.listSalesByCustomer(customerId);
      return sales.map(mapSaleToFrontend);
    },
    enabled: isReady && !!customerId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useRecordSale() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: string | null;
      items: FrontendSaleItem[];
      paymentMethod: FrontendPaymentMethod;
      amountPaid: number;
    }) => {
      if (!actor) throw new Error('Not authenticated');
      
      const backendItems = mapSaleItemsToBackend(params.items);
      const backendPaymentMethod = mapPaymentMethodToBackend(params.paymentMethod);
      // For PIX, Debit, and Credit, no change is given, so amountPaidCents is 0
      const amountPaidCents = BigInt(0);

      const sale = await actor.recordSale(
        params.customerId,
        backendItems,
        backendPaymentMethod,
        amountPaidCents
      );
      
      return mapSaleToFrontend(sale);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteSale() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.deleteSale(BigInt(saleId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useCancelSale() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      if (!actor) throw new Error('Not authenticated');
      const result = await actor.cancelSaleToday(BigInt(saleId));
      if (!result) {
        throw new Error('Não foi possível cancelar a venda. Ela pode já estar cancelada ou ser de um dia anterior.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useEditSale() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      saleId: string;
      paymentMethod: FrontendPaymentMethod;
      items: FrontendSaleItem[];
    }) => {
      if (!actor) throw new Error('Not authenticated');
      
      const backendPaymentMethod = mapPaymentMethodToBackend(params.paymentMethod);
      const backendItems = mapSaleItemsToBackend(params.items);
      
      const result = await actor.editSaleToday(
        BigInt(params.saleId),
        backendPaymentMethod,
        backendItems
      );
      
      if (!result) {
        throw new Error('Não foi possível editar a venda. Ela pode estar cancelada ou ser de um dia anterior.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      return actor.isCallerAdmin();
    },
    enabled: isReady,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Cash register queries
export function useGetOpenRegisterSession() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['cashRegister', 'open'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const session = await actor.getOpenRegisterSession();
      return session ? mapCashRegisterSessionToFrontend(session) : null;
    },
    enabled: isReady,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useListRegisterSessions() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['cashRegister', 'sessions'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const sessions = await actor.listRegisterSessions();
      return sessions.map(mapCashRegisterSessionToFrontend);
    },
    enabled: isReady,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useOpenRegister() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (initialFloat: number) => {
      if (!actor) throw new Error('Not authenticated');
      
      const request: OpenRegisterRequest = {
        initialFloatCents: brlToCents(initialFloat),
      };
      
      const session = await actor.openRegister(request);
      return mapCashRegisterSessionToFrontend(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashRegister'] });
    },
  });
}

export function useCloseRegister() {
  const { actor } = useAuthenticatedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; finalBalance: number }) => {
      if (!actor) throw new Error('Not authenticated');
      
      const request: CloseRegisterRequest = {
        sessionId: BigInt(params.sessionId),
        finalBalanceCents: brlToCents(params.finalBalance),
      };
      
      await actor.closeRegister(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['closingRecords'] });
    },
  });
}

export function useListClosingRecords() {
  const { actor, isReady } = useAuthenticatedActor();

  return useQuery({
    queryKey: ['closingRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Not authenticated');
      const records = await actor.listClosingRecords();
      return records.map(mapClosingRecordToFrontend);
    },
    enabled: isReady,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
