'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiSearchAction, type AISearchActionParams } from '@/lib/actions/ai-search.action';

export interface SearchResult {
  id: string;
  name: string;
  mimeType: string;
  category: 'image' | 'document';
  relevance_score: number;
  distance: number;
  caption?: string;
  text_preview?: string;
  word_count?: number;
  char_count?: number;
  page_count?: number;
  extraction_method?: string;
  created_time: string;
  thumbnail?: string;
  web_view_link?: string;
  path: string;
  google_drive_account_id?: string;
}

interface UseAISearchReturn {
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  query: string;
  keywords: string[];
  hasSearched: boolean;
  resultsCount: number;
  search: (params: AISearchActionParams) => Promise<void>;
  reset: () => void;
}

/**
 * Drives the AI search Server Action. All state is owned by TanStack — no
 * useState/useEffect/useCallback. The component just reads from the mutation.
 */
export function useAISearch(): UseAISearchReturn {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['ai-search'],
    mutationFn: aiSearchAction,
  });

  const data = mutation.data;
  const inputs = mutation.variables;

  return {
    results: data?.success ? (data.results as SearchResult[]) : [],
    isSearching: mutation.isPending,
    error: data && !data.success ? data.error ?? 'Search failed' : null,
    query: data?.query ?? inputs?.query ?? '',
    keywords: data?.keywords ?? [],
    hasSearched: mutation.isSuccess || mutation.isError,
    resultsCount: data?.results_count ?? 0,
    search: async (params) => {
      if (!params.query.trim()) return;
      await mutation.mutateAsync({ limit: 20, ...params });
    },
    reset: () => {
      mutation.reset();
      queryClient.removeQueries({ queryKey: ['ai-search'] });
    },
  };
}
