"use client"

import { useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { View, ScrollView, RefreshControl, Image, TouchableOpacity, Modal } from "react-native"
import { Card, Title, Paragraph, Button, Chip, ActivityIndicator } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import ApiService, { type AccessLog } from "../services/api"
import { styles } from "../styles/HomeStyles"

export default function HomeScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const navigation = useNavigation()
  const [systemStatus, setSystemStatus] = useState<string>("checking")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const loadData = async () => {
    try {
      // Check system health
      const health = await ApiService.getHealth()
      setSystemStatus(health.status === "ok" ? "online" : "offline")

      // Get recent logs
      const recentLogs = await ApiService.getLogs(0, 5)
      setLogs(recentLogs)
    } catch (error) {
      console.error("Error loading data:", error)
      setSystemStatus("offline")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Use the same color logic as LogsScreen
  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "success":
      case "granted":
        return "#4CAF50"; // green for granted
      case "denied":
        return "#F44336"; // red for denied
      case "error":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  }

  // Use the same icon logic as LogsScreen
  const getStatusIcon = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "success":
      case "granted":
        return "checkmark-circle";
      case "denied":
        return "close-circle";
      case "error":
        return "warning";
      default:
        return "help-circle";
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* System Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Title>System Status</Title>
            <Chip
              icon={() => (
                <Ionicons
                  name={systemStatus === "online" ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color="white"
                />
              )}
              style={[styles.statusChip, { backgroundColor: systemStatus === "online" ? "#4CAF50" : "#F44336" }]}
              textStyle={{ color: "white" }}
            >
              {systemStatus.toUpperCase()}
            </Chip>
          </View>
          <Paragraph>
            FaSer door access control system is {systemStatus === "online" ? "running normally" : "experiencing issues"}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Quick Actions Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="finger-print"
              style={styles.actionButton}
              onPress={() => navigation.navigate("Access")}
            >
              Run Access Check
            </Button>
            <Button
              mode="outlined"
              icon="camera"
              style={styles.actionButton}
              onPress={() => navigation.navigate("Live")}
            >
              View Live Feed
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Activity</Title>
          {logs.length === 0 ? (
            <Paragraph style={styles.noData}>No recent activity</Paragraph>
          ) : (
            logs
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                return (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Chip
                        icon={() => <Ionicons name={getStatusIcon(log.status)} size={16} color="white" />}
                        style={[styles.logStatus, { backgroundColor: getStatusColor(log.status) }]}
                        textStyle={{ color: "white", fontSize: 12 }}
                      >
                        {log.status.toUpperCase()}
                      </Chip>
                      <View style={styles.logTime}>
                        <Paragraph style={{ color: '#666', fontSize: 12 }}>{time}</Paragraph>
                        <Paragraph style={{ color: '#aaa', fontSize: 11 }}>{date}</Paragraph>
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
                  </View>
                )
              })
          )}
        </Card.Content>
      </Card>

      {/* Modal for enlarged image */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }} onPress={() => setSelectedImage(null)}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={{ width: 300, height: 300, borderRadius: 16, borderWidth: 4, borderColor: "#2196F3", resizeMode: "contain" }} />
          )}
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  )
}
