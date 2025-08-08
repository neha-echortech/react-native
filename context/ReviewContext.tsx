import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useState
} from 'react';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
}

interface ReviewContextType {
  reviews: Review[];
  isLoading: boolean;
  createReview: (productId: string, userId: string, username: string, rating: number, comment: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, comment: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  loadProductReviews: (productId: string) => Promise<void>;
  loadUserReviews: (userId: string) => Promise<void>;
  clearReviews: () => Promise<void>;
  getProductAverageRating: (productId: string) => number;
  getProductReviewCount: (productId: string) => number;
  getUserReviewForProduct: (productId: string, userId: string) => Review | undefined;
}

export const ReviewContext = createContext<ReviewContextType>({
  reviews: [],
  isLoading: true,
  createReview: async () => {},
  updateReview: async () => {},
  deleteReview: async () => {},
  loadProductReviews: async () => {},
  loadUserReviews: async () => {},
  clearReviews: async () => {},
  getProductAverageRating: () => 0,
  getProductReviewCount: () => 0,
  getUserReviewForProduct: () => undefined,
});

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const REVIEWS_STORAGE_KEY = '@product_reviews';

  const loadProductReviews = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const allReviews: Review[] = JSON.parse(stored);
        const productReviews = allReviews.filter(review => review.productId === productId);
        setReviews(productReviews);
        setCurrentProductId(productId);
      } else {
        setReviews([]);
        setCurrentProductId(productId);
      }
    } catch (error) {
      console.warn('Failed to load product reviews', error);
      setReviews([]);
      setCurrentProductId(productId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserReviews = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const allReviews: Review[] = JSON.parse(stored);
        const userReviews = allReviews.filter(review => review.userId === userId);
        setReviews(userReviews);
        setCurrentUserId(userId);
      } else {
        setReviews([]);
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.warn('Failed to load user reviews', error);
      setReviews([]);
      setCurrentUserId(userId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReview = useCallback(async (productId: string, userId: string, username: string, rating: number, comment: string) => {
    try {
      const newReview: Review = {
        id: Date.now().toString(),
        productId,
        userId,
        username,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      // Get existing reviews
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      
      // Check if user already reviewed this product
      const existingReviewIndex = allReviews.findIndex(review => 
        review.productId === productId && review.userId === userId
      );

      let updatedReviews: Review[];
      if (existingReviewIndex !== -1) {
        // Update existing review
        updatedReviews = allReviews.map((review, index) => 
          index === existingReviewIndex 
            ? { ...newReview, id: review.id, createdAt: review.createdAt }
            : review
        );
      } else {
        // Add new review
        updatedReviews = [...allReviews, newReview];
      }
      
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
      
      // Update current reviews based on context
      if (currentProductId === productId) {
        const productReviews = updatedReviews.filter(review => review.productId === productId);
        setReviews(productReviews);
      } else if (currentUserId === userId) {
        const userReviews = updatedReviews.filter(review => review.userId === userId);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error('Failed to create review', error);
      throw new Error('Failed to create review');
    }
  }, [currentProductId, currentUserId]);

  const updateReview = useCallback(async (reviewId: string, rating: number, comment: string) => {
    try {
      // Get existing reviews
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      
      // Find and update the review
      const updatedReviews = allReviews.map(review => 
        review.id === reviewId 
          ? { ...review, rating, comment }
          : review
      );
      
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
      
      // Update current reviews
      if (currentProductId) {
        const productReviews = updatedReviews.filter(review => review.productId === currentProductId);
        setReviews(productReviews);
      } else if (currentUserId) {
        const userReviews = updatedReviews.filter(review => review.userId === currentUserId);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error('Failed to update review', error);
      throw new Error('Failed to update review');
    }
  }, [currentProductId, currentUserId]);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      // Get existing reviews
      const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      const allReviews: Review[] = stored ? JSON.parse(stored) : [];
      
      // Remove the review
      const updatedReviews = allReviews.filter(review => review.id !== reviewId);
      await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
      
      // Update current reviews
      if (currentProductId) {
        const productReviews = updatedReviews.filter(review => review.productId === currentProductId);
        setReviews(productReviews);
      } else if (currentUserId) {
        const userReviews = updatedReviews.filter(review => review.userId === currentUserId);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error('Failed to delete review', error);
      throw new Error('Failed to delete review');
    }
  }, [currentProductId, currentUserId]);

  const getProductAverageRating = useCallback((productId: string): number => {
    const productReviews = reviews.filter(review => review.productId === productId);
    if (productReviews.length === 0) return 0;
    
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / productReviews.length) * 10) / 10; // Round to 1 decimal
  }, [reviews]);

  const getProductReviewCount = useCallback((productId: string): number => {
    return reviews.filter(review => review.productId === productId).length;
  }, [reviews]);

  const getUserReviewForProduct = useCallback((productId: string, userId: string): Review | undefined => {
    return reviews.find(review => review.productId === productId && review.userId === userId);
  }, [reviews]);

  const clearReviews = useCallback(async () => {
    setReviews([]);
    setCurrentProductId(null);
    setCurrentUserId(null);
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isLoading,
        createReview,
        updateReview,
        deleteReview,
        loadProductReviews,
        loadUserReviews,
        clearReviews,
        getProductAverageRating,
        getProductReviewCount,
        getUserReviewForProduct,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}; 