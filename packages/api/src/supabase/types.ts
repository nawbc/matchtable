export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProfilesRow = {
  id: string
  user_id: string
  nickname: string | null
  gender: string | null
  birthday: string | null
  avatar_url: string | null
  height: number | null
  weight: number | null
  education: string | null
  school: string | null
  city: string | null
  occupation: string | null
  income: string | null
  house: boolean
  car: boolean
  marital_status: string | null
  accept_ldr: boolean
  hobbies: string[] | null
  requirements: string | null
  bio: string | null
  status: string
  created_at: string
  updated_at: string
}

export type ProfileContactsRow = {
  profile_id: string
  wechat: string | null
  line: string | null
  telegram: string | null
  email: string | null
  updated_at: string
}

export type ProfilePhotosRow = {
  id: string
  profile_id: string
  url: string
  sort_order: number
  created_at: string
}

type ProfilesInsert = Omit<ProfilesRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

type ProfilePhotosInsert = Omit<ProfilePhotosRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow
        Insert: ProfilesInsert
        Update: Partial<ProfilesInsert>
        Relationships: []
      }
      profile_photos: {
        Row: ProfilePhotosRow
        Insert: ProfilePhotosInsert
        Update: Partial<ProfilePhotosInsert>
        Relationships: []
      }
      profile_contacts: {
        Row: ProfileContactsRow
        Insert: Omit<ProfileContactsRow, 'updated_at'> & { updated_at?: string }
        Update: Partial<Omit<ProfileContactsRow, 'profile_id'>>
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          created_at: string
        }
        Insert: { user_id: string; profile_id: string; id?: string; created_at?: string }
        Update: Partial<{ user_id: string; profile_id: string }>
        Relationships: []
      }
      requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          from_user_id: string
          to_user_id: string
          message?: string | null
          status?: string
        }
        Update: Partial<{ message: string | null; status: string }>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_user_id: string
          reason: string | null
          detail: string | null
          status: string
          created_at: string
        }
        Insert: {
          reporter_id: string
          target_user_id: string
          reason?: string | null
          detail?: string | null
        }
        Update: Partial<{ reason: string | null; detail: string | null; status: string }>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
