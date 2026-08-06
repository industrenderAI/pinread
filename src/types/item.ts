export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Annotation {
  id: string
  start: number
  end: number
  note: string
}

export interface Item {
  id: string
  content: string
  source: string
  category: string
  createdAt: number
  updatedAt: number
  annotations: Annotation[]
}

export interface Category {
  
  id: string
  name: string
  color?: string
}