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
import { ReviewContext } from '../context/ReviewContext';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { username } = useContext(AuthContext);
  const { products, isLoading, createProduct, updateProduct, deleteProduct, loadUserProducts, clearProducts } = useContext(ProductContext);
  const { addToCart, getCartItemCount, refreshCartItems, showAddToCartSuccess, hideAddToCartSuccess, updateQuantity, cartItems, loadCart } = useContext(CartContext);
  const { getProductAverageRating, getProductReviewCount } = useContext(ReviewContext);
  
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
  
  // Enhanced variation management
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [tempOptions, setTempOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  
  // Two-step variation system
  const [showVariationTypeModal, setShowVariationTypeModal] = useState(false);
  const [showVariationOptionsModal, setShowVariationOptionsModal] = useState(false);
  const [selectedVariationType, setSelectedVariationType] = useState<string>('');
  const [isEditingVariation, setIsEditingVariation] = useState(false);
  const [editingVariationData, setEditingVariationData] = useState<ProductVariation | null>(null);

  // Predefined variation types
  const variationTypes = [
    { name: 'Size', icon: '👕', placeholder: 'e.g., Small, Medium, Large' },
    { name: 'Color', icon: '🎨', placeholder: 'e.g., Red, Blue, Green' },
    { name: 'Length', icon: '📏', placeholder: 'e.g., Short, Medium, Long' },
    { name: 'Material', icon: '🧵', placeholder: 'e.g., Cotton, Polyester, Wool' },
    { name: 'Style', icon: '👔', placeholder: 'e.g., Casual, Formal, Sporty' },
    { name: 'Other', icon: '💬', placeholder: 'e.g., Custom options' }
  ];
  const priceInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (username) {
      loadUserProducts(username);
      loadCart(username);
      // Load reviews for all products
      products.forEach(product => {
        // This will be called after products are loaded
      });
    } else {
      clearProducts();
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [username, loadUserProducts, loadCart, clearProducts]);

  // Load reviews when products change
  useEffect(() => {
    if (products.length > 0) {
      products.forEach(product => {
        // Load reviews for each product
        // This ensures reviews are available for rating display
      });
    }
  }, [products]);

  // Auto-hide success banner after 3 seconds
  useEffect(() => {
    if (showAddToCartSuccess) {
      const timer = setTimeout(() => {
        hideAddToCartSuccess();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showAddToCartSuccess, hideAddToCartSuccess]);



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
    setShowVariationTypeModal(false);
    setShowVariationOptionsModal(false);
    setSelectedVariationType('');
    setTempOptions([]);
    setNewOption('');
    setIsEditingVariation(false);
    setEditingVariationData(null);
  };

  const handleAddToCart = async (product: Product) => {
    // Check if product has variations
    if (product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
      
      // Initialize selected variations with default values
      const defaultSelections: {[key: string]: string} = {};
      
      // For each variation, if it has only one option, pre-select it
      product.variations.forEach(variation => {
        if (variation.options.length === 1) {
          defaultSelections[variation.name] = variation.options[0];
        }
      });
      
      setSelectedVariations(defaultSelections);
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
    console.log('handleAddVariation called');
    // Show variation type selection modal
    setShowVariationTypeModal(true);
    console.log('setShowVariationTypeModal set to true');
  };

  const handleSelectVariationType = (variationType: string) => {
    setSelectedVariationType(variationType);
    setShowVariationTypeModal(false);
    setShowVariationOptionsModal(true);
    
    // Reset form for new variation
    setTempOptions([]);
    setNewOption('');
    setIsEditingVariation(false);
    setEditingVariationData(null);
  };

  const handleSaveVariationOptions = () => {
    if (tempOptions.length === 0) {
      Alert.alert('Error', 'Please add at least one option');
      return;
    }

    // Check for duplicate variation names
    const existingVariation = productVariations.find(v => 
      v.name.toLowerCase() === selectedVariationType.toLowerCase()
    );
    
    if (existingVariation && !isEditingVariation) {
      Alert.alert('Error', 'A variation with this name already exists');
      return;
    }

    const newVariation: ProductVariation = {
      name: selectedVariationType,
      options: [...tempOptions]
    };

    if (isEditingVariation && editingVariationData) {
      // Update existing variation
      setProductVariations(prev => prev.map((v, i) => 
        v.name === editingVariationData.name ? newVariation : v
      ));
    } else {
      // Add new variation
      setProductVariations(prev => [...prev, newVariation]);
    }

    // Reset form
    setSelectedVariationType('');
    setTempOptions([]);
    setNewOption('');
    setShowVariationOptionsModal(false);
    setIsEditingVariation(false);
    setEditingVariationData(null);
  };

  const handleEditVariation = (index: number) => {
    const variation = productVariations[index];
    setSelectedVariationType(variation.name);
    setTempOptions([...variation.options]);
    setIsEditingVariation(true);
    setEditingVariationData(variation);
    setShowVariationOptionsModal(true);
  };

  const handleRemoveVariation = (index: number) => {
    Alert.alert(
      'Remove Variation',
      `Are you sure you want to remove "${productVariations[index].name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProductVariations(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleAddOption = () => {
    if (!newOption.trim()) {
      Alert.alert('Error', 'Please enter an option name');
      return;
    }

    if (tempOptions.includes(newOption.trim())) {
      Alert.alert('Error', 'This option already exists');
      return;
    }

    setTempOptions(prev => [...prev, newOption.trim()]);
    setNewOption('');
  };

  const handleRemoveOption = (optionIndex: number) => {
    setTempOptions(prev => prev.filter((_, i) => i !== optionIndex));
  };

  const handleCancelVariationForm = () => {
    setSelectedVariationType('');
    setTempOptions([]);
    setNewOption('');
    setShowVariationTypeModal(false);
    setShowVariationOptionsModal(false);
    setIsEditingVariation(false);
    setEditingVariationData(null);
  };

  const renderStars = (rating: number, size: number = 12) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={[styles.star, { fontSize: size }]}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
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
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.profileButtonText}>
                  👤
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
                      <View style={styles.ratingContainer}>
                        {renderStars(getProductAverageRating(item.id))}
                        <Text style={styles.reviewCount}>
                          ({getProductReviewCount(item.id)} reviews)
                        </Text>
                      </View>
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
                      {(() => {
                        // Check if this product has variations
                        const hasVariations = item.variations && item.variations.length > 0;
                        
                        if (hasVariations) {
                          // For products with variations, we need to show "Add to Cart" button
                          // because we can't know which specific variation the user wants to modify
                          // The variation selection modal will handle the logic
                          return (
                            <TouchableOpacity 
                              style={[styles.actionButton, styles.addToCartButton]}
                              onPress={() => handleAddToCart(item)}
                            >
                              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                            </TouchableOpacity>
                          );
                        } else {
                          // For products without variations, check if it's already in cart
                          const cartItem = cartItems.find(cartItem => cartItem.product.id === item.id);
                          if (cartItem) {
                            return (
                              <View style={styles.quantityContainer}>
                                <TouchableOpacity 
                                  style={styles.quantityButton}
                                  onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                >
                                  <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                                <TouchableOpacity 
                                  style={styles.quantityButton}
                                  onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
                                >
                                  <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          } else {
                            return (
                              <TouchableOpacity 
                                style={[styles.actionButton, styles.addToCartButton]}
                                onPress={() => handleAddToCart(item)}
                              >
                                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                              </TouchableOpacity>
                            );
                          }
                        }
                      })()}
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteProduct(item)}
                        disabled={isDeleting}
                      >
                        <Text style={styles.deleteButtonText}>
                          {isDeleting ? '...' : '×'}
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
                    onPress={handleAddVariation}
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
                          <View style={styles.optionsContainer}>
                            {variation.options.map((option, optionIndex) => (
                              <View key={optionIndex} style={styles.optionTag}>
                                <Text style={styles.optionTagText}>{option}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={styles.variationActions}>
                          <TouchableOpacity
                            style={styles.editVariationButton}
                            onPress={() => handleEditVariation(index)}
                          >
                            <Text style={styles.editVariationButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeVariationButton}
                            onPress={() => handleRemoveVariation(index)}
                          >
                            <Text style={styles.removeVariationButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
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
              <Text style={styles.modalTitle}>
                {selectedProduct && selectedProduct.variations?.every(v => 
                  v.options.length === 1
                ) ? 'Confirm Selection' : 'Select Variations'}
              </Text>
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

      {/* Step 1: Variation Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVariationTypeModal}
        onRequestClose={() => setShowVariationTypeModal(false)}
        onShow={() => console.log('Variation type modal shown')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a variation:</Text>
              <TouchableOpacity
                onPress={() => setShowVariationTypeModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {variationTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.variationTypeItem}
                  onPress={() => handleSelectVariationType(type.name)}
                >
                  <View style={styles.variationTypeContent}>
                    <Text style={styles.variationTypeIcon}>{type.icon}</Text>
                    <Text style={styles.variationTypeName}>{type.name}</Text>
                  </View>
                  <Text style={styles.variationTypeArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Step 2: Variation Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVariationOptionsModal}
        onRequestClose={() => setShowVariationOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (isEditingVariation && editingVariationData) {
                    handleRemoveVariation(productVariations.findIndex(v => v.name === editingVariationData.name));
                  }
                  setShowVariationOptionsModal(false);
                }}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{selectedVariationType}</Text>
                <TouchableOpacity style={styles.editIcon}>
                  <Text style={styles.editIconText}>✏️</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveVariationOptions}
              >
                <Text style={styles.saveButtonText}>✓</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Existing Options */}
              {tempOptions.map((option, index) => (
                <View key={index} style={styles.existingOptionItem}>
                  <TouchableOpacity style={styles.reorderIcon}>
                    <Text style={styles.reorderIconText}>↕️</Text>
                  </TouchableOpacity>
                  <Text style={styles.existingOptionText}>{option}</Text>
                  <TouchableOpacity
                    style={styles.removeOptionButton}
                    onPress={() => handleRemoveOption(index)}
                  >
                    <Text style={styles.removeOptionButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Add New Option */}
              <View style={styles.addNewOptionContainer}>
                <TouchableOpacity style={styles.addNewOptionButton}>
                  <Text style={styles.addNewOptionIcon}>+</Text>
                </TouchableOpacity>
                <View style={styles.addNewOptionInputContainer}>
                  <TextInput
                    style={styles.addNewOptionInput}
                    placeholder={`New ${selectedVariationType}`}
                    placeholderTextColor="#9CA3AF"
                    value={newOption}
                    onChangeText={setNewOption}
                    onSubmitEditing={handleAddOption}
                  />
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleAddOption}
                  >
                    <Text style={styles.addOptionButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add to Cart Success Banner */}
      {showAddToCartSuccess && (
        <Animated.View 
          style={styles.successBanner}
          entering={Animated.timing(new Animated.Value(0), {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })}
        >
          <View style={styles.successBannerContent}>
            <Text style={styles.successBannerText}>
              {getCartItemCount()} Item{getCartItemCount() !== 1 ? 's' : ''} added
            </Text>
            <TouchableOpacity 
              style={styles.viewCartButton}
              onPress={() => {
                hideAddToCartSuccess();
                router.push('/cart');
              }}
            >
              <Text style={styles.viewCartButtonText}>View Cart ></Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => {}}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/order')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navLabel}>Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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

  profileButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  star: {
    color: '#F59E0B',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    paddingHorizontal: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
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
  successBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  successBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewCartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewCartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  // New styles for enhanced variation management
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  optionTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0288D1',
  },
  optionTagText: {
    fontSize: 12,
    color: '#0277BD',
    fontWeight: '500',
  },
  variationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editVariationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editVariationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  optionInput: {
    flex: 1,
  },
  addOptionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addOptionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tempOptionsContainer: {
    marginTop: 12,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tempOptionTag: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tempOptionTagText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '500',
  },
  removeOptionButton: {
    backgroundColor: '#FEF2F2',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeOptionButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },

  // Two-step variation system styles
  variationTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  variationTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  variationTypeIcon: {
    fontSize: 24,
  },
  variationTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  variationTypeArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 14,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  existingOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reorderIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reorderIconText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  existingOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  addNewOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  addNewOptionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewOptionIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addNewOptionInputContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  addNewOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#F0F9FF',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default HomeScreen;
