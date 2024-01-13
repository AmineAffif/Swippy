// components/ImageDisplay.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

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
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default ImageDisplay;
