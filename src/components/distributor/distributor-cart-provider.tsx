"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addProduct: (p: { id: string; name: string; price: number; imageUrl: string | null }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  totalQty: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function DistributorCartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addProduct = useCallback((p: { id: string; name: string; price: number; imageUrl: string | null }) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        const next = [...prev];
        const cur = next[i]!;
        next[i] = {
          productId: cur.productId,
          name: cur.name,
          unitPrice: cur.unitPrice,
          imageUrl: cur.imageUrl,
          quantity: cur.quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          unitPrice: p.price,
          imageUrl: p.imageUrl,
          quantity: 1,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.max(0, Math.floor(quantity));
    setLines((prev) => {
      if (q === 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { totalQty, totalAmount } = useMemo(() => {
    return lines.reduce(
      (acc, l) => ({
        totalQty: acc.totalQty + l.quantity,
        totalAmount: acc.totalAmount + l.unitPrice * l.quantity,
      }),
      { totalQty: 0, totalAmount: 0 },
    );
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      addProduct,
      setQuantity,
      removeLine,
      clear,
      totalQty,
      totalAmount,
    }),
    [lines, addProduct, setQuantity, removeLine, clear, totalQty, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useDistributorCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useDistributorCart must be used within DistributorCartProvider");
  return ctx;
}
