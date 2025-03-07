import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Modal,
    Text,
    ScrollView,
    Pressable,
    useWindowDimensions,
    Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const ImagePreviewModal = ({ images, isVisible, onClose, onDelete }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const { height } = useWindowDimensions();

    const handleDelete = (imageToDelete) => {
        if (selectedImages.length > 0) {
            const imagesToDelete = [...selectedImages];
            onDelete(imagesToDelete);
            setSelectedImages([]);
        } else if (imageToDelete) {
            onDelete([imageToDelete]);
            if (imageToDelete === selectedImage) {
                setSelectedImage(null);
                setFullScreen(false);
            }
        }
    };

    const toggleImageSelection = (image) => {
        if (selectedImages.includes(image)) {
            setSelectedImages(prev => prev.filter(img => img !== image));
        } else {
            setSelectedImages(prev => [...prev, image]);
        }
    };

    const ImageThumbnail = ({ item, index }) => (
        <View className="relative">
            <Pressable
                onLongPress={() => toggleImageSelection(item)}
                onPress={() => {
                    if (selectedImages.length > 0) {
                        toggleImageSelection(item);
                    } else {
                        setSelectedImage(item);
                        setFullScreen(true);
                    }
                }}
                className="relative aspect-square m-0.5 md:m-1"
            >
                <Image
                    source={{ uri: item.uri }}
                    className="w-full h-full rounded-xl md:rounded-2xl"
                    resizeMode="cover"
                />
                
                {selectedImages.includes(item) && (
                    <View className="absolute inset-0 bg-primary/30 rounded-xl md:rounded-2xl items-center justify-center">
                        <View className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                    </View>
                )}
                
                <View className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-black/50 items-center justify-center">
                    <Text className="text-white text-[10px] md:text-xs font-medium">{index + 1}</Text>
                </View>
            </Pressable>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            statusBarTranslucent
        >
            <StatusBar style="light" />
            <Pressable 
                onPress={onClose}
                className="flex-1 bg-black/50"
            >
                <View 
                    className="absolute bottom-0 w-full rounded-t-2xl md:rounded-t-3xl bg-neutral-900"
                    style={{ maxHeight: height * 0.9 }}
                >
                    {/* Handle Bar */}
                    <View className="items-center pt-1.5 md:pt-2 pb-3 md:pb-4">
                        <View className="w-8 md:w-10 h-1 rounded-full bg-neutral-600" />
                    </View>

                    {/* Header */}
                    <View className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 md:space-y-4">
                        <View className="flex-row items-center justify-between">
                            {selectedImages.length > 0 ? (
                                <View className="flex-row items-center space-x-2 md:space-x-3">
                                    <TouchableOpacity
                                        onPress={() => handleDelete()}
                                        className="flex-row items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-red-500"
                                    >
                                        <Ionicons name="trash-outline" size={16} color="white" />
                                        <Text className="text-white text-sm md:text-base font-medium">
                                            Delete ({selectedImages.length})
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        onPress={() => setSelectedImages([])}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-800 items-center justify-center"
                                    >
                                        <Ionicons name="close-circle" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="flex-row items-center space-x-2 md:space-x-3">
                                    <Text className="text-white text-base md:text-lg font-semibold">
                                        Captured Images ({images.length})
                                    </Text>
                                    {images.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setSelectedImages(images)}
                                            className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-neutral-800"
                                        >
                                            <Text className="text-white text-sm md:text-base font-medium">Select All</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                        
                        {/* Selection Progress */}
                        {images.length > 0 && (
                            <View className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                <View 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${(selectedImages.length / images.length) * 100}%` }}
                                />
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <ScrollView 
                        className="flex-1 px-3 md:px-4"
                        showsVerticalScrollIndicator={false}
                    >
                        {images.length > 0 ? (
                            <View className="flex-row flex-wrap pb-6 md:pb-8">
                                {images.map((item, index) => (
                                    <View key={index} className="w-1/3">
                                        <ImageThumbnail item={item} index={index} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="py-16 md:py-20 items-center">
                                <View className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-800 items-center justify-center mb-3 md:mb-4">
                                    <Ionicons name="images-outline" size={32} color="white" />
                                </View>
                                <Text className="text-white/80 text-base md:text-lg font-medium text-center">
                                    No images captured yet
                                </Text>
                                <Text className="text-white/60 text-xs md:text-sm mt-1.5 md:mt-2 text-center max-w-[250px]">
                                    Capture some notes or documents to see them here
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Pressable>

            {/* Full Screen Image Modal */}
            <Modal visible={fullScreen} transparent={true} animationType="fade">
                <View className="flex-1 bg-black">
                    <Pressable 
                        className="flex-1"
                        onPress={() => setFullScreen(false)}
                    >
                        {selectedImage && (
                            <View className="flex-1">
                                <Image
                                    source={{ uri: selectedImage.uri }}
                                    className="flex-1"
                                    resizeMode="contain"
                                />
                                
                                <View className="absolute inset-x-0 top-safe px-3 md:px-4 py-2 md:py-3">
                                    <View className="flex-row items-center justify-between bg-black/90 rounded-full px-3 md:px-4 py-1.5 md:py-2">
                                        <TouchableOpacity
                                            onPress={() => setFullScreen(false)}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-800 items-center justify-center"
                                        >
                                            <Ionicons name="chevron-back" size={20} color="white" />
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            onPress={() => handleDelete(selectedImage)}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500 items-center justify-center"
                                        >
                                            <Ionicons name="trash-outline" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </View>
            </Modal>
        </Modal>
    );
};

export default ImagePreviewModal;
