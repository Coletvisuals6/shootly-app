export type Role = 'client' | 'creator' | 'admin'
export type CreatorStatus = 'pending' | 'approved' | 'rejected'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

export interface Creator {
  id: string
  status: CreatorStatus
  bio: string | null
  specialty: string | null
  location: string | null
  travel_miles: number
  response_time: string
  projects_completed: number
  stripe_account_id: string | null
  created_at: string
  profiles?: Profile
  creator_specialties?: { id: string; name: string }[]
  creator_equipment?: { id: string; name: string }[]
  portfolio_photos?: PortfolioPhoto[]
  packages?: Package[]
}

export interface PortfolioPhoto {
  id: string
  creator_id: string
  url: string
  position: number
  created_at: string
}

export interface Package {
  id: string
  creator_id: string
  name: string
  description: string | null
  price: number
  features: string[]
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  creator_id: string
  package_id: string | null
  event_date: string | null
  status: BookingStatus
  stripe_payment_intent_id: string | null
  amount: number | null
  notes: string | null
  created_at: string
  profiles?: Profile
  creators?: Creator & { profiles?: Profile }
  packages?: Package
}

export interface Conversation {
  id: string
  client_id: string
  creator_id: string
  booking_id: string | null
  created_at: string
  client?: Profile
  creator?: Creator & { profiles?: Profile }
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  profiles?: Profile
}
