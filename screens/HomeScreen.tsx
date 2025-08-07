import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Product, ProductContext, ProductVariation } from '../context/ProductContext';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { username, logout } = useContext(AuthContext);
  const { products, isLoading, createProduct, updateProduct, deleteProduct, loadUserProducts, clearProducts } = useContext(ProductContext);
  const { addToCart, getCartItemCount, refreshCartItems } = useContext(CartContext);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(''); // Discount percentage
  const [isCreating, setIsCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: string}>({});
  
  // Variation form states
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [variationName, setVariationName] = useState('');
  const [variationOptions, setVariationOptions] = useState('');
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
  const priceInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (username) {
      loadUserProducts(username);
    } else {
      clearProducts();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [username, loadUserProducts, clearProducts]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logging out...');
              await logout();
              console.log('Logout successful');
              // Force navigation to login screen
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCreateProduct = async () => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Validate discount percentage
    const discountValue = discountPercentage.trim() ? parseFloat(discountPercentage) : 0;
    if (discountPercentage.trim() && (isNaN(discountValue) || discountValue < 0 || discountValue > 100)) {
      Alert.alert('Error', 'Please enter a valid discount percentage (0-100)');
      return;
    }

    setIsCreating(true);
    try {
      await createProduct(name.trim(), description.trim(), priceValue, username!, productVariations, discountValue > 0 ? discountValue : undefined);
      setName('');
      setDescription('');
      setPrice('');
      setDiscountPercentage('');
      setProductVariations([]);
      setModalVisible(false);
      Alert.alert('Success', 'Product created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };



  const handleUpdateProduct = async () => {
    if (!editingProduct || !name.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Validate discount percentage
    const discountValue = discountPercentage.trim() ? parseFloat(discountPercentage) : 0;
    if (discountPercentage.trim() && (isNaN(discountValue) || discountValue < 0 || discountValue > 100)) {
      Alert.alert('Error', 'Please enter a valid discount percentage (0-100)');
      return;
    }

    setIsEditing(true);
    try {
      await updateProduct(editingProduct.id, name.trim(), description.trim(), priceValue, productVariations, discountValue > 0 ? discountValue : undefined);
      
      // Refresh cart items with updated product data
      await refreshCartItems();
      
      setEditingProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setDiscountPercentage('');
      setProductVariations([]);
      setModalVisible(false);
      Alert.alert('Success', 'Product updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteProduct(product.id);
              
              // Refresh cart items after deletion (product will be removed from cart automatically)
              await refreshCartItems();
              
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPercentage('');
    setProductVariations([]);
    setShowVariationForm(false);
    setVariationName('');
    setVariationOptions('');
  };

  const handleAddToCart = async (product: Product) => {
    // Check if product has variations
    if (product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
      setSelectedVariations({});
      setShowVariationModal(true);
    } else {
      // No variations, add directly to cart
      try {
        await addToCart(product);
        Alert.alert('Success', 'Product added to cart!');
      } catch (error) {
        Alert.alert('Error', 'Failed to add product to cart');
      }
    }
  };

  const handleVariationSelection = (variationName: string, option: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationName]: option
    }));
  };

  const handleConfirmVariationSelection = async () => {
    if (!selectedProduct) return;

    // Check if all variations are selected
    const hasAllVariations = selectedProduct.variations?.every(variation => 
      selectedVariations[variation.name]
    );

    if (!hasAllVariations) {
      Alert.alert('Error', 'Please select all variations before adding to cart.');
      return;
    }

    try {
      // Add product with variations to cart
      await addToCart(selectedProduct, selectedVariations);
      Alert.alert('Success', 'Product added to cart!');
      setShowVariationModal(false);
      setSelectedProduct(null);
      setSelectedVariations({});
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleAddVariation = () => {
    if (!variationName.trim() || !variationOptions.trim()) {
      Alert.alert('Error', 'Please fill in variation name and options');
      return;
    }

    const options = variationOptions.split(',').map(option => option.trim()).filter(option => option.length > 0);
    if (options.length === 0) {
      Alert.alert('Error', 'Please enter at least one option');
      return;
    }

    const newVariation: ProductVariation = {
      name: variationName.trim(),
      options: options
    };

    setProductVariations(prev => [...prev, newVariation]);
    setVariationName('');
    setVariationOptions('');
    setShowVariationForm(false);
  };

  const handleRemoveVariation = (index: number) => {
    setProductVariations(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.originalPrice ? product.originalPrice.toString() : product.price.toString());
    setDiscountPercentage(product.discountPercentage ? product.discountPercentage.toString() : '');
    setProductVariations(product.variations || []);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {username ?? 'User'}</Text>
              <Text style={styles.subtitle}>Manage your products</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={handleCartPress}
              >
                <Text style={styles.cartButtonText}>
                  🛒 {getCartItemCount()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {products.length}
              </Text>
              <Text style={styles.statLabel}>
                Total Products
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                ${products.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>
                Total Value
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>
          
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Products Yet</Text>
              <Text style={styles.emptyText}>
                Start by adding your first product to the catalog
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.emptyAddButtonText}>
                  Add Your First Product
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsContainer}>
              {products.map((item, index) => (
                <Animated.View 
                  key={item.id}
                  style={[
                    styles.productCard,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.productHeader}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.name}
                      </Text>
                      <Text style={styles.productDescription}>
                        {item.description}
                      </Text>
                    </View>
                    <View style={styles.priceSection}>
                      {item.discountPercentage ? (
                        <View style={styles.discountedPriceContainer}>
                          <Text style={styles.originalPrice}>
                            ${item.originalPrice?.toFixed(2)}
                          </Text>
                          <Text style={styles.productPrice}>
                            ${item.price.toFixed(2)}
                          </Text>
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>
                              -{item.discountPercentage}%
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.productPrice}>
                          ${item.price.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.productFooter}>
                    <Text style={styles.productDate}>
                      Created: {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                    <View style={styles.productActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditProduct(item)}
                      >
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.addToCartButton]}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteProduct(item)}
                        disabled={isDeleting}
                      >
                        <Text style={styles.deleteButtonText}>
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your product"
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price ($)</Text>
                <TextInput
                  ref={priceInputRef}
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={(text) => {
                    if (text.length > price.length) {
                      const newChar = text[text.length - 1];
                      if (!/[0-9.]/.test(newChar)) return;
                      if (newChar === '.' && price.includes('.')) return;
                      const decimalIndex = price.indexOf('.');
                      if (decimalIndex !== -1 && text.length > decimalIndex + 3) return;
                      if (text.length > 10) return;
                    }
                    setPrice(text);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Discount Percentage (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={discountPercentage}
                  onChangeText={(text) => {
                    if (text.length > discountPercentage.length) {
                      const newChar = text[text.length - 1];
                      if (!/[0-9.]/.test(newChar)) return;
                      if (newChar === '.' && discountPercentage.includes('.')) return;
                      const decimalIndex = discountPercentage.indexOf('.');
                      if (decimalIndex !== -1 && text.length > decimalIndex + 1) return;
                      if (text.length > 5) return;
                    }
                    setDiscountPercentage(text);
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {discountPercentage.trim() && (
                  <Text style={styles.discountPreview}>
                    Final Price: ${((parseFloat(price) || 0) * (1 - (parseFloat(discountPercentage) || 0) / 100)).toFixed(2)}
                  </Text>
                )}
              </View>
              
              {/* Variations Section */}
              <View style={styles.inputGroup}>
                <View style={styles.variationHeader}>
                  <Text style={styles.inputLabel}>Variations</Text>
                  <TouchableOpacity
                    style={styles.addVariationButton}
                    onPress={() => setShowVariationForm(true)}
                  >
                    <Text style={styles.addVariationButtonText}>+ Add Variation</Text>
                  </TouchableOpacity>
                </View>
                
                {productVariations.length > 0 && (
                  <View style={styles.variationsList}>
                    {productVariations.map((variation, index) => (
                      <View key={index} style={styles.variationItem}>
                        <View style={styles.variationInfo}>
                          <Text style={styles.variationName}>{variation.name}</Text>
                                                  <Text style={styles.variationOptionsText}>
                          {variation.options.join(', ')}
                        </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeVariationButton}
                          onPress={() => handleRemoveVariation(index)}
                        >
                          <Text style={styles.removeVariationButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingProduct ? handleUpdateProduct : handleCreateProduct}
                disabled={isCreating || isEditing}
              >
                <Text style={styles.submitButtonText}>
                  {isCreating ? 'Adding...' : isEditing ? 'Updating...' : editingProduct ? 'Update Product' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Variation Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVariationModal}
        onRequestClose={() => setShowVariationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Variations</Text>
              <TouchableOpacity
                onPress={() => setShowVariationModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedProduct && (
                <View>
                  <Text style={styles.productTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.productPrice}>${selectedProduct.price.toFixed(2)}</Text>
                  
                  {selectedProduct.variations?.map((variation, index) => (
                    <View key={index} style={styles.variationGroup}>
                      <Text style={styles.variationLabel}>{variation.name}</Text>
                      <View style={styles.variationOptionsContainer}>
                        {variation.options.map((option, optionIndex) => (
                          <TouchableOpacity
                            key={optionIndex}
                            style={[
                              styles.variationOption,
                              selectedVariations[variation.name] === option && styles.selectedVariationOption
                            ]}
                            onPress={() => handleVariationSelection(variation.name, option)}
                          >
                            <Text style={[
                              styles.variationOptionText,
                              selectedVariations[variation.name] === option && styles.selectedVariationOptionText
                            ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowVariationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleConfirmVariationSelection}
              >
                <Text style={styles.submitButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Variation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVariationForm}
        onRequestClose={() => setShowVariationForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Variation</Text>
              <TouchableOpacity
                onPress={() => setShowVariationForm(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Variation Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Size, Color, Material"
                  placeholderTextColor="#9CA3AF"
                  value={variationName}
                  onChangeText={setVariationName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Options (comma-separated)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Small, Medium, Large"
                  placeholderTextColor="#9CA3AF"
                  value={variationOptions}
                  onChangeText={setVariationOptions}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowVariationForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddVariation}
              >
                <Text style={styles.submitButtonText}>Add Variation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productsContainer: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  discountedPriceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  discountPreview: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#10B981',
  },
  addToCartButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  // Variation styles
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addVariationButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addVariationButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  variationsList: {
    gap: 8,
  },
  variationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  variationInfo: {
    flex: 1,
  },
  variationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  variationOptionsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeVariationButton: {
    backgroundColor: '#FEF2F2',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeVariationButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  variationGroup: {
    marginBottom: 20,
  },
  variationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  variationOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variationOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedVariationOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  variationOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedVariationOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HomeScreen;
