import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAttributes() {
  return useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const response = await fetch('/api/attributes');
      const result = await response.json();
      return result.data;
    }
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    }
  });
}