
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export interface CartItem {
  plantId: number;
  plantName: string;
  plantPrice: number;
  quantity: number;
  itemTotal: number;
}

interface CartData {
  userEmail: string;
  items: CartItem[];
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (plantId: number) => Promise<void>;
  removeItem: (plantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  decreaseQuantity: (plantId: number) => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 장바구니 조회
  const { data: cartData, isLoading, refetch } = useQuery<CartData>({
    queryKey: ["/carts"],
    queryFn: () => apiRequest("GET", "/carts"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1분
  });

  // 장바구니 항목 추가
  const addItemMutation = useMutation({
    mutationFn: (plantId: number) =>
      apiRequest("POST", "/carts", { plantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/carts"] });
    },
    onError: (error: any) => {
      console.error("Failed to add item to cart:", error);
      throw error;
    },
  });

  // 수량 감소
  const decreaseQuantityMutation = useMutation({
    mutationFn: (plantId: number) =>
      apiRequest("PATCH", `/carts/${plantId}/quantity`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/carts"] });
    },
    onError: (error: any) => {
      console.error("Failed to decrease quantity:", error);
      throw error;
    },
  });

  // 항목 제거
  const removeItemMutation = useMutation({
    mutationFn: (plantId: number) =>
      apiRequest("DELETE", `/carts/${plantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/carts"] });
    },
    onError: (error: any) => {
      console.error("Failed to remove item:", error);
      throw error;
    },
  });

  // 장바구니 비우기
  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/carts"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/carts"] });
    },
    onError: (error: any) => {
      console.error("Failed to clear cart:", error);
      throw error;
    },
  });

  const items = cartData?.items || [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartData?.totalPrice || 0;

  const addItem = async (plantId: number) => {
    await addItemMutation.mutateAsync(plantId);
  };

  const removeItem = async (plantId: number) => {
    await removeItemMutation.mutateAsync(plantId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const decreaseQuantity = async (plantId: number) => {
    await decreaseQuantityMutation.mutateAsync(plantId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isLoading,
        addItem,
        removeItem,
        clearCart,
        decreaseQuantity,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
