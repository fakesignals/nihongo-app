import Dexie, { type Table } from 'dexie'
import type { Word } from './types'

class NihongoDB extends Dexie {
  words!: Table<Word, string>
  constructor() {
    super('nihongo-pocket')
    this.version(1).stores({
      words: 'id, jp, category, fav, createdAt, due, state'
    })
  }
}

export const db = new NihongoDB()
