// components/ImageDisplay.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const ImageDisplay = ({ imageUri }) => {
  if (!imageUri) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
});

export default ImageDisplay;
