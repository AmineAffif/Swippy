// components/ImageDisplay.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

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
    width: screenWidth,
    height: screenHeight,
  },
  image: {
    width: "90%",
    height: "90%",
    resizeMode: 'contain',
    position: 'absolute',
  },
});

export default ImageDisplay;
