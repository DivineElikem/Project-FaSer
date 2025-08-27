import { StyleSheet } from "react-native"

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
  card: {
    marginBottom: 16,
    elevation: 4,
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  noData: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 16,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  logStatus: {
    alignSelf: "flex-start",
  },
  logTime: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  logDetails: {
    marginBottom: 8,
  },
  logUser: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
})
