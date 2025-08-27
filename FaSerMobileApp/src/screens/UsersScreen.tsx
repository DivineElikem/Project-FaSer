"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, Alert, Image } from "react-native"
import {
  Card,
  Title,
  Button,
  List,
  Switch,
  FAB,
  Portal,
  Dialog,
  TextInput,
  ActivityIndicator,
  Chip,
  Paragraph,
} from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import ApiService, { type User } from "../services/api"
import { styles } from "../styles/UsersStyles"

interface UserWithPhoto extends User {
  photoUri?: string
}

export default function UsersScreen() {
  const [users, setUsers] = useState<UserWithPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userName, setUserName] = useState("")
  const [userActive, setUserActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [takingPhoto, setTakingPhoto] = useState(false)

  const loadUsers = async () => {
    try {
      const usersList = await ApiService.getUsers()
      // For demo purposes, we'll simulate having user photos
      // In a real app, you'd fetch the actual photo URLs from your backend
      const usersWithPhotos = usersList.map((user) => ({
        ...user,
        photoUri: user.face_image_url ? ApiService.getFaceImageUrl(user.face_image_url) : undefined,
      }))
      setUsers(usersWithPhotos)
    } catch (error) {
      console.error("Error loading users:", error)
      Alert.alert("Error", "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setUserName(user.name)
      setUserActive(user.active)
      setCapturedImage(null)
      setDialogVisible(true)
    } else {
      setEditingUser(null)
      setUserName("")
      setUserActive(true)
      setCapturedImage(null)
      takePhotoForNewUser()
    }
  }

  const takePhotoForNewUser = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Camera access is required to take a photo for the new user. Please grant camera permissions.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: takePhotoForNewUser },
        ],
      )
      return
    }

    setTakingPhoto(true)
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: "front",
      })

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri)
        setDialogVisible(true)
      } else {
        Alert.alert("Photo Required", "A photo is required to create a new user. Would you like to try again?", [
          { text: "Cancel", style: "cancel" },
          { text: "Take Photo", onPress: takePhotoForNewUser },
        ])
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo. Please try again.")
    } finally {
      setTakingPhoto(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    takePhotoForNewUser()
  }

  const closeDialog = () => {
    setDialogVisible(false)
    setEditingUser(null)
    setUserName("")
    setUserActive(true)
    setCapturedImage(null)
  }

  const saveUser = async () => {
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter a user name")
      return
    }

    if (!editingUser && !capturedImage) {
      Alert.alert("Error", "Photo is required for new users")
      return
    }

    setSaving(true)
    try {
      let savedUser: User

      if (editingUser) {
        savedUser = await ApiService.updateUser(editingUser.id, userName, userActive)
      } else {
        savedUser = await ApiService.createUser(userName, userActive)

        if (capturedImage) {
          const formData = new FormData()
          formData.append("file", {
            uri: capturedImage,
            type: "image/jpeg",
            name: "face.jpg",
          } as any)

          await ApiService.uploadUserPhoto(savedUser.id, formData)
        }
      }

      closeDialog()
      loadUsers()
      Alert.alert("Success", editingUser ? "User updated successfully" : "User created successfully with photo")
    } catch (error) {
      console.error("Error saving user:", error)
      Alert.alert("Error", "Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogVisible(true)
  }

  const deleteUser = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      await ApiService.deleteUser(userToDelete.id)
      setDeleteDialogVisible(false)
      setUserToDelete(null)
      loadUsers()
      Alert.alert("Success", "User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      Alert.alert("Error", "Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  const updateUserPhoto = async (user: User) => {
    Alert.alert("Update Photo", `Take a new photo for ${user.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== "granted") {
            Alert.alert("Permission needed", "Please grant camera permissions.")
            return
          }

          try {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              cameraType: "front",
            })

            if (!result.canceled) {
              const formData = new FormData()
              formData.append("file", {
                uri: result.assets[0].uri,
                type: "image/jpeg",
                name: "face.jpg",
              } as any)

              await ApiService.uploadUserPhoto(user.id, formData)
              Alert.alert("Success", "Photo updated successfully")
              loadUsers()
            }
          } catch (error) {
            console.error("Error updating photo:", error)
            Alert.alert("Error", "Failed to update photo")
          }
        },
      },
    ])
  }

  const toggleUserStatus = async (user: User) => {
    try {
      await ApiService.updateUser(user.id, user.name, !user.active)
      loadUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      Alert.alert("Error", "Failed to update user status")
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    )
  }

  if (takingPhoto) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Title style={styles.loadingText}>Opening Camera...</Title>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title>System Users ({users.length})</Title>
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#9E9E9E" />
                <Title style={styles.emptyTitle}>No Users Found</Title>
                <Paragraph style={styles.emptyDescription}>Add your first user by taking their photo</Paragraph>
                <Button mode="contained" onPress={() => openDialog()} icon="camera">
                  Add First User
                </Button>
              </View>
            ) : (
              users.map((user) => (
                <List.Item
                  key={user.id}
                  title={user.name}
                  description={`ID: ${user.id}`}
                  left={() => (
                    <View style={styles.userAvatar}>
                      {user.photoUri ? (
                        <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
                      ) : (
                        <Ionicons name="person" size={24} color="#2196F3" />
                      )}
                    </View>
                  )}
                  right={() => (
                    <View style={styles.userActions}>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: user.active ? "#4CAF50" : "#F44336" }]}
                        textStyle={{ color: "white", fontSize: 12 }}
                      >
                        {user.active ? "ACTIVE" : "INACTIVE"}
                      </Chip>
                      <Switch value={user.active} onValueChange={() => toggleUserStatus(user)} />
                    </View>
                  )}
                  onPress={() => {
                    Alert.alert(
                      user.name,
                      "Choose an action",
                      [
                        { text: "Edit Info", onPress: () => openDialog(user) },
                        { text: "Delete", style: "destructive", onPress: () => confirmDeleteUser(user) },
                        { text: "Cancel", style: "cancel" },
                      ]
                    )
                  }}
                  style={styles.userItem}
                />
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB icon="camera" style={styles.fab} onPress={() => openDialog()} label="Add User" />

      {/* User Creation/Edit Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
          <Dialog.Title>{editingUser ? "Edit User" : "Create New User"}</Dialog.Title>
          <Dialog.Content>
            {(!editingUser && capturedImage) ? (
              <View style={styles.photoPreview}>
                <Title style={styles.photoTitle}>Captured Photo</Title>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                <Button mode="outlined" onPress={retakePhoto} icon="camera" style={styles.retakeButton}>
                  Retake Photo
                </Button>
              </View>
            ) : null}

            {editingUser && (
              <Button
                mode="outlined"
                icon="camera"
                style={styles.retakeButton}
                onPress={() => updateUserPhoto(editingUser)}
              >
                Update Photo
              </Button>
            )}

            <TextInput
              label="User Name"
              value={userName}
              onChangeText={setUserName}
              mode="outlined"
              style={styles.input}
              autoFocus={!!capturedImage || !!editingUser}
            />

            <View style={styles.switchContainer}>
              <Title style={styles.switchLabel}>Active</Title>
              <Switch value={userActive} onValueChange={setUserActive} />
            </View>

            {!editingUser && (
              <Paragraph style={styles.photoNote}>
                📸 Photo has been captured and will be saved with the user profile
              </Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={saveUser}
              loading={saving}
              disabled={saving || (!editingUser && !capturedImage)}
            >
              {saving ? "Saving..." : editingUser ? "Update" : "Create User"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <View style={styles.deleteConfirmation}>
              <Ionicons name="warning" size={48} color="#F44336" />
              <Title style={styles.deleteTitle}>Are you sure?</Title>
              <Paragraph style={styles.deleteMessage}>
                This will permanently delete "{userToDelete?.name}" and all associated data. This action cannot be
                undone.
              </Paragraph>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={deleteUser} loading={deleting} disabled={deleting} buttonColor="#F44336">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}
