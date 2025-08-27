import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    margin: 16,
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: "#666",
  },
  emptyDescription: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  userItem: {
    marginVertical: 4,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusChip: {
    alignSelf: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2196F3",
  },
  dialog: {
    maxHeight: "80%",
  },
  photoPreview: {
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  photoTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 12,
  },
  retakeButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  photoNote: {
    fontSize: 12,
    color: "#4CAF50",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  deleteConfirmation: {
    alignItems: "center",
    paddingVertical: 16,
  },
  deleteTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: "#F44336",
  },
  deleteMessage: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
})
