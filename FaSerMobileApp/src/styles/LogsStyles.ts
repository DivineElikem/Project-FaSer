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
  filterCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  limitButtons: {
    flexDirection: "row",
    gap: 4,
  },
  logsList: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  divider: {
    marginVertical: 8,
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
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
  logItem: {
    paddingVertical: 12,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusChip: {
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
  logId: {
    fontSize: 12,
    color: "#666",
  },
  faceEncodingContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  faceEncodingLabel: {
    fontSize: 12,
    color: "#666",
  },
  logDivider: {
    marginTop: 12,
  },
})
