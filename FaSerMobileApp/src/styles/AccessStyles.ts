import { StyleSheet, Dimensions } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  scannerCard: {
    marginBottom: 16,
    elevation: 4,
    flex: 1,
  },
  scannerTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  cameraContainer: {
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  faceFrame: {
    width: 250,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#2196F3",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#2196F3",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  statusContainer: {
    position: "absolute",
    bottom: -60,
    alignItems: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noPermissionContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noPermissionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: "#F44336",
  },
  noPermissionText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  controls: {
    alignItems: "center",
    marginTop: 16,
  },
  scanButton: {
    minWidth: 200,
  },
  resultContainer: {
    marginTop: 16,
  },
  resultChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  resultDetails: {
    marginTop: 8,
  },
})
