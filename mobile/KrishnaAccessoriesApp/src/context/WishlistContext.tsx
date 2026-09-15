import React, { createContext, useState, useEffect, useContext } from 'react';
import { wishlistService } from '../services/api/wishlistService';
import { Wishlist, WishlistItem } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);

  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      setWishlist(null);
    }
  }, [user]);

  const refreshWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch {
      // Ignored
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return !!wishlist?.items?.some(i => i.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await wishlistService.remove(productId);
    } else {
      await wishlistService.add(productId);
    }
    await refreshWishlist();
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
