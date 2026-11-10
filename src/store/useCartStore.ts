import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // unique hash for the item configuration
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color?: string;
  customizations?: any;
  variationId?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, qty: number) => void;
  updateItemVariant: (id: string, newSize: string, newPrice: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const currentItems = get().items;
        const itemId = newItem.id || `${newItem.productId}-${newItem.size}-${newItem.color || 'default'}`;
        const itemWithId = { ...newItem, id: itemId };
        const existingItem = currentItems.find((item) => item.id === itemId);
        const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity + qtyToAdd }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...itemWithId, quantity: qtyToAdd }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, delta) => {
        const currentItems = get().items;
        set({
          items: currentItems
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: newQty };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        });
      },
      
      setQuantity: (id, qty) => {
        const currentItems = get().items;
        if (qty <= 0) {
          set({ items: currentItems.filter((item) => item.id !== id) });
          return;
        }
        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity: qty } : item
          ),
        });
      },
      
      updateItemVariant: (id, newSize, newPrice) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                size: newSize,
                price: newPrice,
                id: `${item.productId}-${newSize}-${item.color || 'default'}`,
              };
            }
            return item;
          }),
        });
      },
      
      setItems: (items) => set({ items }),
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 0),
          0
        );
      },
    }),
    {
      name: "xevora_cart_storage",
    }
  )
);
