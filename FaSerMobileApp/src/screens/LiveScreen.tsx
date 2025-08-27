"use client"

import { useState, useEffect } from "react"
import { View, Alert } from "react-native"
import { Card, Title, Button, Paragraph, ActivityIndicator, Chip } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import { WebView } from "react-native-webview"
import MJPEGPlayer from "../components/MJPEGPlayer"
import ApiService, { type CameraStatus } from "../services/api"
import { styles } from "../styles/LiveStyles"

export default function LiveScreen() {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [restarting, setRestarting] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  // Fetch camera status
  const loadCameraStatus = async () => {
    try {
      setLoading(true)
      const status = await ApiService.getCameraStatus()
      setCameraStatus(status)
      setVideoError(null)
    } catch (error) {
      console.error("Error loading camera status:", error)
      Alert.alert("Error", "Failed to load camera status")
    } finally {
      setLoading(false)
    }
  }

  // Restart camera on server
  const restartCamera = async () => {
    setRestarting(true)
    try {
      await ApiService.restartCamera()
      Alert.alert("Success", "Camera restarted successfully")
      await loadCameraStatus()
    } catch (error) {
      console.error("Error restarting camera:", error)
      Alert.alert("Error", "Failed to restart camera")
    } finally {
      setRestarting(false)
    }
  }

  useEffect(() => {
    loadCameraStatus()
  }, [])

  // The URL must be the MJPEG stream served by your backend
  const streamUrl = ApiService.getCameraStreamUrl()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Camera Status Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Title>Camera Status</Title>
            <Chip
              icon={() => <Ionicons name="camera" size={16} color="white" />}
              style={[
                styles.statusChip,
                { backgroundColor: cameraStatus?.status === "available" ? "#4CAF50" : "#F44336" },
              ]}
              textStyle={{ color: "white" }}
            >
              {cameraStatus?.status?.toUpperCase() || "UNKNOWN"}
            </Chip>
          </View>
          {cameraStatus && (
            <View style={styles.statusDetails}>
              <Paragraph>Camera Index: {cameraStatus.camera_index}</Paragraph>
              <Paragraph>Frame Size: {cameraStatus.frame_size}</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Live Stream Section */}
      <Card style={styles.streamCard}>
        <Card.Content>
          <Title>Live Stream</Title>
          <View style={styles.streamContainer}>
            {/* Loading overlay */}
            {videoLoading && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "black",
                  zIndex: 10,
                  borderRadius: 8,
                }}
              >
                <ActivityIndicator size="large" color="#2196F3" />
                <Paragraph style={{ color: "white", marginTop: 8 }}>Loading stream...</Paragraph>
              </View>
            )}

            {/* Error message */}
            {videoError && (
              <Paragraph style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                Error loading stream: {videoError}
              </Paragraph>
            )}

            {/* MJPEG WebView player */}
            <MJPEGPlayer
              streamUrl={streamUrl}
              style={styles.camera}
              onLoadEnd={() => setVideoLoading(false)}
              onError={() => {
                setVideoError("Could not play the video stream.")
                setVideoLoading(false)
                Alert.alert("Error", "Failed to load live stream from server.")
              }}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Camera Controls Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Camera Controls</Title>
          <View style={styles.controls}>
            <Button
              mode="contained"
              icon="refresh"
              loading={restarting}
              disabled={restarting}
              onPress={restartCamera}
              style={styles.controlButton}
            >
              Restart Camera
            </Button>
            <Button
              mode="outlined"
              icon="refresh"
              onPress={loadCameraStatus}
              style={styles.controlButton}
            >
              Refresh Status
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  )
}
