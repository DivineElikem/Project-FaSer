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
  streamCard: {
    marginBottom: 16,
    elevation: 4,
    flex: 1,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  statusDetails: {
    marginTop: 8,
  },
  streamContainer: {
    marginTop: 16,
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraLoading: {
    alignItems: "center",
  },
  cameraLoadingText: {
    color: "#FFFFFF",
    marginTop: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
})
