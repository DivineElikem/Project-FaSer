"use client"

import { useState, useRef, useEffect } from "react"
import { View, Alert, Dimensions, Animated, ScrollView, Image } from "react-native"
import { Card, Title, Button, Paragraph, Chip, ActivityIndicator } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import { Camera, CameraView } from "expo-camera"
import ApiService, { type RecognitionResult } from "../services/api"
import { styles } from "../styles/AccessStyles"
import { useIsFocused } from "@react-navigation/native"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function AccessScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const cameraRef = useRef<CameraView>(null)
  const captureTimeout = useRef<NodeJS.Timeout | null>(null)
  const scanAnimation = useRef(new Animated.Value(0)).current
  const isFocused = useIsFocused()

  useEffect(() => {
    requestCameraPermission()
    return () => {
      if (captureTimeout.current) {
        clearTimeout(captureTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (scanning) {
      startScanAnimation()
    } else {
      stopScanAnimation()
    }
  }, [scanning])

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === "granted")
  }

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  const stopScanAnimation = () => {
    scanAnimation.stopAnimation()
    scanAnimation.setValue(0)
  }

  const startScanning = () => {
    setScanning(true)
    setResult(null)
    if (captureTimeout.current) {
      clearTimeout(captureTimeout.current)
    }
    captureTimeout.current = setTimeout(() => {
      if (cameraRef.current) {
        captureAndRecognize()
      }
    }, 3000)
  }

  const stopScanning = () => {
    setScanning(false)
    if (captureTimeout.current) {
      clearTimeout(captureTimeout.current)
      captureTimeout.current = null
      if (cameraRef.current && cameraReady) {
        captureAndRecognize()
      }
    }
  }

  const captureAndRecognize = async () => {
    if (!cameraRef.current || !cameraReady) {
      Alert.alert("Error", "Camera not ready")
      return
    }

    setRecognizing(true)
    setScanning(false)

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      })

      const formData = new FormData()
      formData.append("file", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "face.jpg",
      } as any)

      const recognitionResult = await ApiService.recognizeFace(formData)
      setResult(recognitionResult)
    } catch (error) {
      console.error("Error during recognition:", error)
      Alert.alert("Error", "Failed to run face recognition")
    } finally {
      setRecognizing(false)
    }
  }

  const getResultColor = (status: string) => {
    switch (status) {
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

  const getResultIcon = (status: string) => {
    switch (status) {
      case "granted":
        return "checkmark-circle"
      case "denied":
        return "close-circle"
      case "error":
        return "warning"
      default:
        return "help-circle"
    }
  }

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Title style={styles.loadingText}>Requesting camera permission...</Title>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.noPermissionContainer}>
              <Ionicons name="camera" size={64} color="#F44336" />
              <Title style={styles.noPermissionTitle}>Camera Permission Required</Title>
              <Paragraph style={styles.noPermissionText}>
                Please grant camera permissions to use face recognition.
              </Paragraph>
              <Button mode="contained" onPress={requestCameraPermission} icon="camera">
                Grant Permission
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* Face Scanner */}
        <Card style={styles.scannerCard}>
          <Card.Content>
            <Title style={styles.scannerTitle}>Face Recognition Scanner</Title>
            <View style={styles.cameraContainer}>
              {isFocused && (
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="front"
                  onCameraReady={() => setCameraReady(true)}
                >
                  {/* Scanner Overlay */}
                  <View style={styles.scannerOverlay}>
                    {/* Face Detection Frame */}
                    <View style={styles.faceFrame}>
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />

                      {/* Scanning Line Animation */}
                      {scanning && (
                        <Animated.View
                          style={[
                            styles.scanLine,
                            {
                              transform: [
                                {
                                  translateY: scanAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 200],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      )}
                    </View>

                    {/* Status Text */}
                    <View style={styles.statusContainer}>
                      {!cameraReady && <Paragraph style={styles.statusText}>Initializing camera...</Paragraph>}
                      {cameraReady && !scanning && !recognizing && (
                        <Paragraph style={styles.statusText}>Position your face in the frame</Paragraph>
                      )}
                      {scanning && <Paragraph style={styles.statusText}>Scanning face...</Paragraph>}
                      {recognizing && <Paragraph style={styles.statusText}>Processing...</Paragraph>}
                    </View>
                  </View>
                </CameraView>
              )}
              {!isFocused && (
                <View style={[styles.camera, { backgroundColor: "#000" }]} />
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Controls */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Access Control</Title>
            <View style={styles.controls}>
              {!scanning && !recognizing && (
                <Button
                  mode="contained"
                  icon="face-recognition"
                  onPress={startScanning}
                  disabled={!cameraReady}
                  style={styles.scanButton}
                >
                  Start Face Scan
                </Button>
              )}
              {scanning && (
                <Button mode="outlined" icon="stop" onPress={stopScanning} style={styles.scanButton}>
                  Stop Scanning
                </Button>
              )}
              {recognizing && (
                <Button mode="contained" loading={true} disabled={true} style={styles.scanButton}>
                  Processing...
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
        {result && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Access Result</Title>
              <View style={styles.resultContainer}>
                <Chip
                  icon={() => <Ionicons name={getResultIcon(result.status)} size={16} color="white" />}
                  style={[styles.resultChip, { backgroundColor: getResultColor(result.status) }]}
                  textStyle={{ color: "white" }}
                >
                  {result.status.toUpperCase()}
                </Chip>
                {result.face_image_url && (
                  <View style={{ alignItems: "center", marginVertical: 12 }}>
                    <Title style={{ fontSize: 16 }}>Captured Face</Title>
                    <View style={{ borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "#2196F3", marginTop: 4 }}>
                      <Image
                        source={{ uri: ApiService.getFaceImageUrl(result.face_image_url) ?? undefined }}
                        style={{ width: 120, height: 120, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                )}
                <View style={styles.resultDetails}>
                  <Paragraph>
                    User: {result.user_name ? result.user_name : (result.user_id ?? "Unknown")}
                  </Paragraph>
                  <Paragraph>
                    Message: {result.message}
                  </Paragraph>
                  <Paragraph>Time: {new Date(result.timestamp).toLocaleString()}</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}
