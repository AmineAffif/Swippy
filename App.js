import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import ImageDisplay from "./components/ImageDisplay"; // Ajustez le chemin selon votre structure de dossier
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);

  const getTotalPhotoCount = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return 0;
    }

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 1, // Nous demandons juste un élément pour obtenir le compte total
    });

    return media.totalCount;
  };

  const pickRandomImage = async () => {
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

    // Récupérer un échantillon initial de photos pour obtenir un identifiant aléatoire
    const initialBatch = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: randomStartIndex + 1, // +1 pour inclure la photo à l'index randomStartIndex
    });

    if (initialBatch.assets.length > 0) {
      const randomAssetId =
        initialBatch.assets[initialBatch.assets.length - 1].id;

      // Utiliser cet identifiant pour charger l'échantillon final de photos
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
  };

  const likeImage = () => {
    pickRandomImage(); // Charge une nouvelle image aléatoire
  };
  const dislikeImage = () => {
    pickRandomImage(); // Pour l'instant, cela charge simplement une nouvelle image aléatoire
    // Logique de suppression à implémenter si nécessaire
  };

  useEffect(() => {
    pickRandomImage();
  }, []);

  return (
    <View style={styles.container}>
      {/* Afficher l'image sélectionnée */}
      <ImageDisplay imageUri={image} />
      {imageIndex !== null && (
        <Text style={styles.imageIndexText}>Index: {imageIndex}</Text>
      )}
      {/* Like/Dislike image */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={likeImage}
          style={[styles.button, styles.button.green]}
        >
          <Text>❤️ Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={dislikeImage}
          style={[styles.button, styles.button.red]}
        >
          <Text>❌ Dislike</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
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
    width: "100%", // Assurez-vous que le conteneur occupe toute la largeur
    padding: 20, // Ajoutez du padding pour l'espacement
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
});
