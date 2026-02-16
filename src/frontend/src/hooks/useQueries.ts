import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
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
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      const customers = await actor.listCustomers();
      return customers.map(mapCustomerToFrontend);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomer(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!actor) return null;
      const customer = await actor.getCustomer(id);
      return mapCustomerToFrontend(customer);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCustomerRequest) => {
      if (!actor) throw new Error('Actor not available');
      const customer = await actor.createCustomer(request);
      return mapCustomerToFrontend(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateCustomerRequest) => {
      if (!actor) throw new Error('Actor not available');
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
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      const sales = await actor.listSales();
      return sales.map(mapSaleToFrontend);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListSalesByCustomer(customerId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['sales', 'customer', customerId],
    queryFn: async () => {
      if (!actor) return [];
      const sales = await actor.listSalesByCustomer(customerId);
      return sales.map(mapSaleToFrontend);
    },
    enabled: !!actor && !isFetching && !!customerId,
  });
}

export function useRecordSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: string;
      items: FrontendSaleItem[];
      paymentMethod: FrontendPaymentMethod;
      amountPaid: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const backendItems = mapSaleItemsToBackend(params.items);
      const backendPaymentMethod = mapPaymentMethodToBackend(params.paymentMethod);
      const amountPaidCents = brlToCents(params.paymentMethod === 'Cash' ? params.amountPaid : 0);

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

// Cash register queries
export function useGetOpenRegisterSession() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['cashRegister', 'open'],
    queryFn: async () => {
      if (!actor) return null;
      const session = await actor.getOpenRegisterSession();
      return session ? mapCashRegisterSessionToFrontend(session) : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListRegisterSessions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['cashRegister', 'sessions'],
    queryFn: async () => {
      if (!actor) return [];
      const sessions = await actor.listRegisterSessions();
      return sessions.map(mapCashRegisterSessionToFrontend);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOpenRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (initialFloat: number) => {
      if (!actor) throw new Error('Actor not available');
      
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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; finalBalance: number }) => {
      if (!actor) throw new Error('Actor not available');
      
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
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['closingRecords'],
    queryFn: async () => {
      if (!actor) return [];
      const records = await actor.listClosingRecords();
      return records.map(mapClosingRecordToFrontend);
    },
    enabled: !!actor && !isFetching,
  });
}
