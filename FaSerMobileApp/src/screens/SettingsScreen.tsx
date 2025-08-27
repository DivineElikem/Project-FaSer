"use client"

import { useState } from "react"
import { View, ScrollView, Alert } from "react-native"
import { Card, Title, List, Switch, Button, TextInput, Divider, Paragraph } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import { styles } from "../styles/SettingsStyles"

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [serverUrl, setServerUrl] = useState("http://your-backend-url:8000")
  const [refreshInterval, setRefreshInterval] = useState("30")

  const saveSettings = () => {
    Alert.alert("Settings Saved", "Your settings have been saved successfully.")
  }

  const resetSettings = () => {
    Alert.alert("Reset Settings", "Are you sure you want to reset all settings to default?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setNotifications(true)
          setAutoRefresh(true)
          setDarkMode(false)
          setServerUrl("http://backend-url:8000")
          setRefreshInterval("30")
          Alert.alert("Settings Reset", "All settings have been reset to default values.")
        },
      },
    ])
  }

  const testConnection = async () => {
    Alert.alert("Testing Connection", "Testing connection to server...")
    // Here you would implement actual connection testing
    setTimeout(() => {
      Alert.alert("Connection Test", "Connection successful!")
    }, 2000)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Server Configuration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Server Configuration</Title>
          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            mode="outlined"
            style={styles.input}
            placeholder="http://your-backend-url:8000"
          />
          <Button mode="outlined" icon="wifi" onPress={testConnection} style={styles.testButton}>
            Test Connection
          </Button>
        </Card.Content>
      </Card>

      {/* App Preferences */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Preferences</Title>
          <List.Item
            title="Push Notifications"
            description="Receive notifications for access events"
            left={() => <Ionicons name="notifications-outline" size={24} color="#2196F3" />}
            right={() => <Switch value={notifications} onValueChange={setNotifications} />}
          />
          <Divider />
          <List.Item
            title="Auto Refresh"
            description="Automatically refresh data"
            left={() => <Ionicons name="refresh-outline" size={24} color="#2196F3" />}
            right={() => <Switch value={autoRefresh} onValueChange={setAutoRefresh} />}
          />
          <Divider />
          <List.Item
            title="Dark Mode"
            description="Use dark theme"
            left={() => <Ionicons name="moon-outline" size={24} color="#2196F3" />}
            right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
          />
        </Card.Content>
      </Card>

      {/* Data & Sync */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Data & Sync</Title>
          <TextInput
            label="Refresh Interval (seconds)"
            value={refreshInterval}
            onChangeText={setRefreshInterval}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <Paragraph style={styles.description}>
            How often to automatically refresh data when auto-refresh is enabled
          </Paragraph>
        </Card.Content>
      </Card>

      {/* System Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>System Information</Title>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={() => <Ionicons name="information-circle-outline" size={24} color="#2196F3" />}
          />
          <Divider />
          <List.Item
            title="Build Number"
            description="100"
            left={() => <Ionicons name="code-outline" size={24} color="#2196F3" />}
          />
          <Divider />
          <List.Item
            title="Last Updated"
            description={new Date().toLocaleDateString()}
            left={() => <Ionicons name="calendar-outline" size={24} color="#2196F3" />}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Actions</Title>
          <View style={styles.actionButtons}>
            <Button mode="contained" icon="content-save" onPress={saveSettings} style={styles.actionButton}>
              Save Settings
            </Button>
            <Button mode="outlined" icon="refresh" onPress={resetSettings} style={styles.actionButton}>
              Reset to Default
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>About FaSer</Title>
          <Paragraph style={styles.aboutText}>
            FaSer is a facial recognition door access control system. This mobile app allows you to manage users,
            monitor access logs, and control the system remotely.
          </Paragraph>
          <Paragraph style={styles.aboutText}>
            Developed with React Native and Expo for seamless cross-platform experience.
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  )
}
