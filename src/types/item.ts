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
  language: string
  createdAt: number
  updatedAt: number
  annotations: Annotation[]
}

export interface Language {
  id: string
  name: string
}
