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
  const [imageId, setImageId] = useState(null);

  const keepOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const imageOpacity = useSharedValue(1);

  const SWIPE_THRESHOLD = 100;

  const [redButtonColor, setRedButtonColor] = useState("#fff");
  const [greenButtonColor, setGreenButtonColor] = useState("#fff");

  const onPressInRed = () => setRedButtonColor("red");
  const onPressOutRed = () => {
    setRedButtonColor("#fff");
    deleteImage();
  };

  const onPressInGreen = () => setGreenButtonColor("green");
  const onPressOutGreen = () => {
    setGreenButtonColor("#fff");
    keepImage();
  };

  const triggerKeeped = () => {
    keepImage();
  };
  const triggerDeleted = () => {
    deleteImage();
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
      keepOpacity.value = translateX.value > 0 ? translateX.value / 400 : 0;
      nopeOpacity.value = translateX.value < 0 ? -translateX.value / 400 : 0;
      const distance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2
      );
      const maxDistance = 300;
      imageOpacity.value = Math.max(1 - distance / maxDistance, 0);
    },
    onEnd: (event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        try {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          rotate.value = withSpring(0);
          runOnJS(triggerKeeped)();
        } catch (error) {
          console.error("Error: ", error);
        }
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        try {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          rotate.value = withSpring(0);
          runOnJS(triggerDeleted)();
        } catch (error) {
          console.error("Error: ", error);
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
      keepOpacity.value = 0;
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

  const keepStyle = useAnimatedStyle(() => {
    return {
      opacity: keepOpacity.value,
    };
  });

  const nopeStyle = useAnimatedStyle(() => {
    return {
      opacity: nopeOpacity.value,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: imageOpacity.value,
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
          setImageId(finalBatch.assets[randomIndexWithinBatch].id);
        }
      }
    } catch (error) {
      console.error("Error picking random image:", error);
    }
  };

  const keepImage = () => {
    console.log("keepImage called");
    pickRandomImage();
  };

  const deleteImage = async () => {
    console.log("deleteImage called");
    if (imageId) {
      try {
        const deleteResult = await MediaLibrary.deleteAssetsAsync([imageId]);
        console.log("Photo deleted", deleteResult);
        if (deleteResult) {
          pickRandomImage();
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };  

  useEffect(() => {
    pickRandomImage();
  }, []);

  useEffect(() => {
    if (image) {
      imageOpacity.value = 1;
    }
  }, [image]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Background blured image */}
      <View style={styles.container}>
        <Image
          source={{ uri: image }}
          style={styles.imageBackgroundStyle}
          blurRadius={100}
        />
        {/* Swipe zone */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[animatedStyle, imageAnimatedStyle]}>
            <ImageDisplay imageUri={image} style={styles.imageStyle} />
          </Animated.View>
        </PanGestureHandler>

        {/* Texts "keep" and "Nope" */}
        <Animated.Text style={[styles.actionText, styles.keepText, keepStyle]}>
          💚 Keep
        </Animated.Text>
        <Animated.Text style={[styles.actionText, styles.nopeText, nopeStyle]}>
          ❌ Delete
        </Animated.Text>

        {/* keep/delete buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.button.red,
              { backgroundColor: redButtonColor },
            ]}
            onPressIn={onPressInRed}
            onPressOut={onPressOutRed}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.button.green,
              { backgroundColor: greenButtonColor },
            ]}
            onPressIn={onPressInGreen}
            onPressOut={onPressOutGreen}
          >
            <Text>💚</Text>
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
    position: "absolute",
    bottom: 100,
  },
  button: {
    position: "absolute",
    bottom: 0,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 50,
    backgroundColor: "#fff",
    opacity: 0.8,
    // iOS Shadow
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    // Android Shadow
    elevation: 5,

    red: {
      left: "30%",
      transform: [{ translateX: -50 }, { translateY: 30 }],
    },
    green: {
      right: "30%",
      transform: [{ translateX: 50 }, { translateY: 30 }],
    },
  },
  imageStyle: {
    width: "100%",
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
  keepText: {},
  nopeText: {},
  imageBackgroundStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
});
