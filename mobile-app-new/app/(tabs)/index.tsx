import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Women Safety AI</Text>

      <TouchableOpacity style={styles.sosButton}>
        <Text style={styles.sosText}>🚨 SOS EMERGENCY</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.text}>📍 Share Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.text}>📞 Emergency Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },

  sosButton: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  sosText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: 220,
    alignItems: "center",
  },

  text: {
    color: "white",
    fontSize: 16,
  },
});