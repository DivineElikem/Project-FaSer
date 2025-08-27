"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, Image } from "react-native"
import { Card, Title, Paragraph, Chip, Button, Menu, ActivityIndicator, Divider } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import ApiService, { type AccessLog } from "../services/api"
import { styles } from "../styles/LogsStyles"

export default function LogsScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterMenuVisible, setFilterMenuVisible] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [limit, setLimit] = useState(20)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const loadLogs = async () => {
    try {
      const filter = statusFilter === "all" ? undefined : statusFilter
      const logsList = await ApiService.getLogs(0, limit, filter)
      setLogs(logsList)
    } catch (error) {
      console.error("Error loading logs:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [statusFilter, limit])

  const onRefresh = () => {
    setRefreshing(true)
    loadLogs()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "granted":
        return "#4CAF50"
      case "denied":
        return "#F44336"
      case "error":
        return "#FF9800"
      default:
        return "#9E9E9E"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "checkmark-circle"
      case "denied":
        return "close-circle"
      case "error":
        return "warning"
      default:
        return "help-circle"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  // Sort logs by latest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Filter Controls */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <View style={styles.filterRow}>
            <Menu
              visible={filterMenuVisible}
              onDismiss={() => setFilterMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setFilterMenuVisible(true)} icon="filter">
                  Filter: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setStatusFilter("all")
                  setFilterMenuVisible(false)
                }}
                title="All"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter("granted")
                  setFilterMenuVisible(false)
                }}
                title="Granted"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter("denied")
                  setFilterMenuVisible(false)
                }}
                title="Denied"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter("error")
                  setFilterMenuVisible(false)
                }}
                title="Error"
              />
            </Menu>

            <View style={styles.limitButtons}>
              <Button mode={limit === 20 ? "contained" : "outlined"} compact onPress={() => setLimit(20)}>
                20
              </Button>
              <Button mode={limit === 50 ? "contained" : "outlined"} compact onPress={() => setLimit(50)}>
                50
              </Button>
              <Button mode={limit === 100 ? "contained" : "outlined"} compact onPress={() => setLimit(100)}>
                100
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Logs List */}
      <ScrollView
        style={styles.logsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title>Access Logs ({sortedLogs.length})</Title>
            <Divider style={styles.divider} />

            {sortedLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
                <Title style={styles.emptyTitle}>No Logs Found</Title>
                <Paragraph style={styles.emptyText}>No access logs match your current filter criteria.</Paragraph>
              </View>
            ) : (
              sortedLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                return (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Chip
                        icon={() => <Ionicons name={getStatusIcon(log.status)} size={16} color="white" />}
                        style={[styles.statusChip, { backgroundColor: getStatusColor(log.status) }]}
                        textStyle={{ color: "white", fontSize: 12 }}
                      >
                        {log.status.toUpperCase()}
                      </Chip>
                      <View style={styles.logTime}>
                        <Paragraph style={styles.timeText}>{time}</Paragraph>
                        <Paragraph style={styles.dateText}>{date}</Paragraph>
                      </View>
                    </View>

                    <View style={styles.logDetails}>
                      <Paragraph style={styles.logUser}>
                        <Ionicons name="person" size={16} color="#666" /> User: {log.user_name ? log.user_name : "Unknown"}
                      </Paragraph>
                    </View>

                    {log.face_image_url && (
                      <View style={{ alignItems: "center", marginVertical: 8 }}>
                        <Title style={{ fontSize: 14 }}>Captured Face</Title>
                        <View style={{ borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "#2196F3", marginTop: 4 }}>
                          <TouchableOpacity onPress={() => setSelectedImage(ApiService.getFaceImageUrl(log.face_image_url) ?? null)}>
                            <Image
                              source={{ uri: ApiService.getFaceImageUrl(log.face_image_url) ?? undefined }}
                              style={{ width: 80, height: 80, resizeMode: "cover" }}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <Divider style={styles.logDivider} />
                  </View>
                )
              })
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      {/* Modal for enlarged image */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }} onPress={() => setSelectedImage(null)}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={{ width: 300, height: 300, borderRadius: 16, borderWidth: 4, borderColor: "#2196F3", resizeMode: "contain" }} />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  )
}
