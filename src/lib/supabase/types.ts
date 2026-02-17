export interface Artist {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export interface Song {
  id: string
  title: string
  slug: string
  artist_id: string
  content: string
  original_key: string | null
  language: string
  genre: string | null
  views: number
  created_at: string
  updated_at: string
}

export interface SongWithArtist extends Song {
  artist: Artist
}

export interface Favorite {
  id: string
  user_id: string
  song_id: string
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: Artist
        Insert: Omit<Artist, 'id' | 'created_at'>
        Update: Partial<Omit<Artist, 'id' | 'created_at'>>
      }
      songs: {
        Row: Song
        Insert: Omit<Song, 'id' | 'created_at' | 'updated_at' | 'views'>
        Update: Partial<Omit<Song, 'id' | 'created_at'>>
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
