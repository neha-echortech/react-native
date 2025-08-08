import React, { useContext, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';

const ProductScreen: React.FC = () => {
  const { username } = useContext(AuthContext);
  const { createProduct, isLoading } = useContext(ProductContext);
  
  const [category, setCategory] = useState('Everyday Electronics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountPercentage, setDiscountPercentage] = useState(''); // Discount percentage
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variations, setVariations] = useState<Array<{name: string, options: string[]}>>([]);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [newVariationName, setNewVariationName] = useState('');
  const [newVariationOptions, setNewVariationOptions] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const categories = [
    'Everyday Electronics',
    'Fashion & Accessories',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Other'
  ];

  const handleAddPhoto = () => {
    if (photos.length >= 8) {
      Alert.alert('Maximum Photos', 'You can only upload up to 8 photos.');
      return;
    }
    // Simulate photo upload - in real app, this would open camera/gallery
    const newPhoto = `https://picsum.photos/300/300?random=${Date.now()}`;
    setPhotos([...photos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => Math.min(prev + 1, 999));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  const handleAddVariation = () => {
    if (!newVariationName.trim() || !newVariationOptions.trim()) {
      Alert.alert('Error', 'Please fill in both variation name and options.');
      return;
    }

    const options = newVariationOptions.split(',').map(option => option.trim()).filter(option => option.length > 0);
    if (options.length === 0) {
      Alert.alert('Error', 'Please add at least one option.');
      return;
    }

    setVariations([...variations, { name: newVariationName.trim(), options }]);
    setNewVariationName('');
    setNewVariationOptions('');
    setShowVariationModal(false);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };



  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate discount percentage
    const discountValue = discountPercentage.trim() ? parseFloat(discountPercentage) : 0;
    if (discountPercentage.trim() && (isNaN(discountValue) || discountValue < 0 || discountValue > 100)) {
      Alert.alert('Error', 'Please enter a valid discount percentage (0-100)');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct(title.trim(), description.trim(), parseFloat(category === 'Everyday Electronics' ? '29.99' : '19.99'), username!, variations, discountValue > 0 ? discountValue : undefined);
      Alert.alert('Success', 'Product created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setDiscountPercentage('');
      setQuantity(1);
      setPhotos([]);
      setVariations([]);
      setCurrentStep(1);
    } catch (error) {
      Alert.alert('Error', 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 5) * 100;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.statusIcons}>
            <View style={styles.signalBars}>
              <View style={styles.bar} />
              <View style={styles.bar} />
              <View style={styles.bar} />
              <View style={styles.bar} />
            </View>
            <View style={styles.wifiIcon}>
              <View style={styles.wifiArc} />
            </View>
            <View style={styles.batteryIcon}>
              <View style={styles.batteryBody} />
              <View style={styles.batteryLevel} />
            </View>
          </View>
        </View>
        
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
          <Text style={styles.screenTitle}>Add Products</Text>
          <TouchableOpacity style={styles.closeButton}>
            <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          {/* Create a Product Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create a Product</Text>
            <Text style={styles.sectionDescription}>
              Detailed product listings show up better in searches. More visibility means more buyers.
            </Text>
            
            {/* Photo Upload Area */}
            <View style={styles.photoSection}>
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.uploadedPhoto} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Text style={styles.removePhotoIcon}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                {photos.length < 8 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                    <Text style={styles.cameraIcon}>📷</Text>
                    <Text style={styles.addPhotoText}>Add Photos</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.photoCount}>Photos: {photos.length}/8</Text>
            </View>
          </View>

          {/* Product Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            
            {/* Category Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category*</Text>
              <TouchableOpacity style={styles.categorySelector}>
                <Text style={styles.categoryText}>{category}</Text>
                <Text style={styles.chevronIcon}>⌄</Text>
              </TouchableOpacity>
            </View>
            
            {/* Title Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title*</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            {/* Description Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description*</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your product in detail..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Discount Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Discount Percentage (%)</Text>
              <TextInput
                style={styles.textInput}
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
                  Final Price: ${((parseFloat(category === 'Everyday Electronics' ? '29.99' : '19.99') || 0) * (1 - (parseFloat(discountPercentage) || 0) / 100)).toFixed(2)}
                </Text>
              )}
            </View>
            

          </View>

          {/* Variations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Product Variations</Text>
              <TouchableOpacity 
                style={styles.addVariationButton}
                onPress={() => setShowVariationModal(true)}
              >
                <Text style={styles.addVariationButtonText}>+ Add Variation</Text>
              </TouchableOpacity>
            </View>
            
            {variations.length === 0 ? (
              <View style={styles.emptyVariations}>
                <Text style={styles.emptyVariationsText}>
                  No variations added yet. Add variations like Size, Color, etc.
                </Text>
              </View>
            ) : (
              <View style={styles.variationsList}>
                {variations.map((variation, index) => (
                  <View key={index} style={styles.variationItem}>
                    <View style={styles.variationInfo}>
                      <Text style={styles.variationName}>{variation.name}</Text>
                      <Text style={styles.variationOptions}>
                        {variation.options.join(', ')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeVariationButton}
                      onPress={() => handleRemoveVariation(index)}
                    >
                      <Text style={styles.removeVariationIcon}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>



          {/* Quantity Available Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity Available</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(false)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(true)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Progress and Navigation */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{currentStep} of 5</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Creating...' : currentStep === 5 ? 'Create Product' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Variation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVariationModal}
        onRequestClose={() => setShowVariationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Variation</Text>
              <TouchableOpacity
                onPress={() => setShowVariationModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Variation Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Size, Color, Material"
                  placeholderTextColor="#9CA3AF"
                  value={newVariationName}
                  onChangeText={setNewVariationName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Options (comma separated)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g., Small, Medium, Large"
                  placeholderTextColor="#9CA3AF"
                  value={newVariationOptions}
                  onChangeText={setNewVariationOptions}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowVariationModal(false)}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  bar: {
    width: 3,
    backgroundColor: '#111827',
    borderRadius: 1,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiArc: {
    width: 12,
      height: 8,
    borderWidth: 1.5,
    borderColor: '#111827',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    flex: 1,
    height: 6,
    backgroundColor: '#111827',
    margin: 1,
    borderRadius: 1,
  },
  batteryLevel: {
    width: 2,
    height: 4,
    backgroundColor: '#111827',
    marginRight: 1,
    borderRadius: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  photoSection: {
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  photoItem: {
    position: 'relative',
  },
  uploadedPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cameraIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  photoCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryText: {
    fontSize: 16,
    color: '#111827',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  quantityDisplay: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minWidth: 60,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addVariationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addVariationButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyVariations: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyVariationsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  variationOptions: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeVariationButton: {
    width: 24,
    height: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeVariationIcon: {
    fontSize: 16,
    color: '#DC2626',
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
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  discountPreview: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 4,
  },

});

export default ProductScreen; 