import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessSetupAPI } from '../api/businessSetup';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  price: number;
  stock_status: string;
  sku: string;
  size: string;
  details: Record<string, unknown>;
}

export interface KnowledgeFile {
  id: string;
  filename: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  upload_timestamp: string;
  size_bytes?: number;
  error?: string;
}

export function useInventory() {
  const queryClient = useQueryClient();

  // Fetch inventory items
  const {
    data: items,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await businessSetupAPI.getInventory();
      return res.items || [];
    },
    staleTime: 2 * 60_000, // 2 minutes
  });

  // Fetch knowledge files
  const {
    data: knowledgeFiles,
    isLoading: knowledgeLoading,
  } = useQuery<KnowledgeFile[]>({
    queryKey: ['knowledge-files'],
    queryFn: () => businessSetupAPI.getKnowledgeFiles(),
    staleTime: 60_000,
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      businessSetupAPI.updateInventoryItem(id, data),
    onSuccess: (_res, variables) => {
      // Optimistic-ish: update cache directly
      queryClient.setQueryData<InventoryItem[]>(['inventory'], (prev) =>
        prev?.map(i => i.id === variables.id ? { ...i, ...variables.data } : i)
      );
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessSetupAPI.deleteInventoryItem(id),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<InventoryItem[]>(['inventory'], (prev) =>
        prev?.filter(i => i.id !== id)
      );
    },
  });

  // Delete knowledge file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => businessSetupAPI.deleteKnowledgeFile(fileId),
    onSuccess: (_res, fileId) => {
      queryClient.setQueryData<KnowledgeFile[]>(['knowledge-files'], (prev) =>
        prev?.filter(f => f.id !== fileId)
      );
    },
  });

  return {
    items: items ?? [],
    inventoryLoading,
    inventoryError: inventoryError instanceof Error ? inventoryError.message : null,
    knowledgeFiles: knowledgeFiles ?? [],
    knowledgeLoading,
    updateItem: (id: string, data: Record<string, unknown>) =>
      updateMutation.mutateAsync({ id, data }),
    updatingItem: updateMutation.isPending,
    deleteItem: (id: string) => deleteMutation.mutateAsync(id),
    deletingItem: deleteMutation.isPending,
    deleteKnowledgeFile: (fileId: string) => deleteFileMutation.mutateAsync(fileId),
    refetchInventory: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-files'] });
    },
  };
}
