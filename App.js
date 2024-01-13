import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import ImageDisplay from "./components/ImageDisplay";
import * as MediaLibrary from "expo-media-library";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);

  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const SWIPE_THRESHOLD = 100;

  const triggerLiked = () => {
    likeImage();
  };
  const triggerDisliked = () => {
    dislikeImage();
  };
  
  // Swipe handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.translateX + event.translationX;
      translateY.value = context.translateY + event.translationY;
      rotate.value = translateX.value / 1000; // Ajust rotation ratio
      likeOpacity.value = translateX.value > 0 ? translateX.value / 400 : 0;
      nopeOpacity.value = translateX.value < 0 ? -translateX.value / 400 : 0;
    },
    onEnd: (event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        try {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          rotate.value = withSpring(0);
          runOnJS(triggerLiked)();
        } catch (error) {
          console.error("Error: ", error);
        }
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        try {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          rotate.value = withSpring(0);
          runOnJS(triggerDisliked)();
        } catch (error) {
          console.error("Error: ", error);
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
      likeOpacity.value = 0;
      nopeOpacity.value = 0;
    },
  });

  // Aniamted styles for image
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}rad` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    return {
      opacity: likeOpacity.value,
    };
  });

  const nopeStyle = useAnimatedStyle(() => {
    return {
      opacity: nopeOpacity.value,
    };
  });

  const getTotalPhotoCount = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return 0;
    }

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 1, // just one photo to get the total count
    });

    return media.totalCount;
  };

  const pickRandomImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need media library permissions to make this work!");
        return;
      }

      const totalPhotos = await getTotalPhotoCount();
      if (totalPhotos === 0) return;

      const batchSize = Math.min(100, totalPhotos);
      const maxStartIndex = totalPhotos - batchSize;
      const randomStartIndex =
        maxStartIndex > 0 ? Math.floor(Math.random() * maxStartIndex) : 0;

      // Pick a random range of photos to get a random initial photo id
      const initialBatch = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: randomStartIndex + 1, // +1 to include randomStartIndex's photo index
      });

      if (initialBatch.assets.length > 0) {
        const randomAssetId =
          initialBatch.assets[initialBatch.assets.length - 1].id;

        // Use this id to load the final batch of photos
        const finalBatch = await MediaLibrary.getAssetsAsync({
          mediaType: "photo",
          first: batchSize,
          after: randomAssetId,
        });

        if (finalBatch.assets.length > 0) {
          const randomIndexWithinBatch = Math.floor(
            Math.random() * finalBatch.assets.length
          );
          setImage(finalBatch.assets[randomIndexWithinBatch].uri);
          setImageIndex(randomStartIndex + randomIndexWithinBatch);
        }
      }
    } catch (error) {
      console.error("Error picking random image:", error);
    }
  };

  const likeImage = () => {
    console.log("likeImage called");
    pickRandomImage();
    // like logic will be here
  };

  const dislikeImage = () => {
    console.log("dislikeImage called");
    pickRandomImage();
    // dislike logic will be here
  };

  useEffect(() => {
    pickRandomImage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Swipe zone */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>
            <ImageDisplay imageUri={image} />
          </Animated.View>
        </PanGestureHandler>

        {/* Texts "Like" and "Nope" */}
        <Animated.Text style={[styles.actionText, styles.likeText, likeStyle]}>
          ❤️ Like
        </Animated.Text>
        <Animated.Text style={[styles.actionText, styles.nopeText, nopeStyle]}>
          ❌ Nope
        </Animated.Text>

        {imageIndex !== null && (
          <Text style={styles.imageIndexText}>Index: {imageIndex}</Text>
        )}

        {/* Like/Dislike image */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={dislikeImage}
            style={[styles.button, styles.button.red]}
          >
            <Text>❌ Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={likeImage}
            style={[styles.button, styles.button.green]}
          >
            <Text>❤️ Like</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
  },
  button: {
    width: 100,
    height: 100,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    red: {
      backgroundColor: "red",
    },
    green: {
      backgroundColor: "green",
    },
  },
  actionText: {
    position: "absolute",
    fontSize: 30,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    opacity: 0,
    color: "#000",
  },
  likeText: {},
  nopeText: {},
});
