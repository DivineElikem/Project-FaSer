import axios from "axios"


const BASE_URL = "http://192.168.16.245:8000" 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})
  
// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)


export interface User {
  id: number
  name: string
  active: boolean
  face_image_url?: string | null
}

export interface AccessLog {
  id: number
  user_id: number | null
  user_name?: string
  status: string
  face_encoding?: string
  face_image_url?: string
  timestamp: string
}

export interface CameraStatus {
  status: string
  camera_index: number
  frame_size: string
}

export interface RecognitionResult {
  id: number
  user_id: number | null
  user_name?: string
  status: string
  timestamp: string
  message: string
  face_image_url?: string
}

class ApiService {
  // Health check
  async getHealth() {
    try {
      const response = await api.get("/health/")
      return response.data
    } catch (error) {
      console.error("Health check failed:", error)
      return { status: "error" }
    }
  }

  // Users endpoints
  async getUsers(skip = 0, limit = 100): Promise<User[]> {
    try {
      const response = await api.get(`/users/?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error("Get users failed:", error)
      return []
    }
  }

  async createUser(name: string, active = true): Promise<User> {
    const response = await api.post("/users/", { name, active })
    return response.data
  }

  async updateUser(userId: number, name: string, active: boolean): Promise<User> {
    const response = await api.put(`/users/${userId}`, { name, active })
    return response.data
  }

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/users/${userId}`)
  }

  async uploadUserPhoto(userId: number, file: FormData): Promise<User> {
    const response = await api.post(`/users/${userId}/photo`, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }

  // Camera endpoints
  getCameraStreamUrl(): string {
    return `${BASE_URL}/camera/stream`
  }

  async getCameraStatus(): Promise<CameraStatus> {
    try {
      const response = await api.get("/camera/status")
      return response.data
    } catch (error) {
      console.error("Get camera status failed:", error)
      return { status: "unavailable", camera_index: -1, frame_size: "unknown" }
    }
  }

  async restartCamera() {
    const response = await api.post("/camera/restart")
    return response.data
  }

  async recognizeFace(file: FormData): Promise<RecognitionResult> {
    const response = await api.post("/camera/recognize", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }

  // Logs endpoints
  async getLogs(skip = 0, limit = 100, status?: string): Promise<AccessLog[]> {
    try {
      let url = `/logs/?skip=${skip}&limit=${limit}`
      if (status) {
        url += `&status=${status}`
      }
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error("Get logs failed:", error)
      return []
    }
  }

  // Utility to get full image URL
  getFaceImageUrl(relativeUrl: string | undefined | null): string | undefined {
    if (!relativeUrl) return undefined
    return `${BASE_URL}${relativeUrl}`
  }
}

export default new ApiService()
