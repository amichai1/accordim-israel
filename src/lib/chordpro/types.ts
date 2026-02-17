export interface ChordWord {
  chord?: string
  text: string
}

export interface SongLine {
  type: 'line' | 'chord-only' | 'empty'
  words: ChordWord[]
}

export interface SongSection {
  type: 'verse' | 'chorus' | 'comment' | 'none'
  label?: string
  lines: SongLine[]
}

export interface SongMeta {
  title?: string
  artist?: string
  key?: string
}

export interface ParsedSong {
  meta: SongMeta
  sections: SongSection[]
}
