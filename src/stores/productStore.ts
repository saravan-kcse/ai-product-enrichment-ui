import { create } from 'zustand';
import { Product, FilterOptions, TaxonomyAttribute } from '../types';

interface ProductStore {
  // State
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  filter: FilterOptions;
  autoAcceptThreshold: number;
  reviewThreshold: number;
  taxonomy: TaxonomyAttribute[];

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: FilterOptions) => void;
  setAutoAcceptThreshold: (threshold: number) => void;
  setReviewThreshold: (threshold: number) => void;
  setTaxonomy: (taxonomy: TaxonomyAttribute[]) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filter: {},
  autoAcceptThreshold: 90,
  reviewThreshold: 70,
  taxonomy: [],

  // Actions
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state) => ({
      products: [product, ...state.products],
    })),
  updateProduct: (productId, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    })),
  deleteProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),
  setAutoAcceptThreshold: (threshold) => set({ autoAcceptThreshold: threshold }),
  setReviewThreshold: (threshold) => set({ reviewThreshold: threshold }),
  setTaxonomy: (taxonomy) => set({ taxonomy }),
  clearError: () => set({ error: null }),
}));
