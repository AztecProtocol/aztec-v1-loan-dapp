import asyncForEach from '../utils/asyncForEach';
import {
  decryptNoteValue,
  restoreFromSharedSecret,
  valueOf,
} from '../utils/note';

class NoteManager {
  constructor() {
    this.sharedSecretNotesMap = new Map();
    this.sharedSecretValueMap = new Map();
  }

  reset() {
    this.sharedSecretNotesMap = new Map();
    this.sharedSecretValueMap = new Map();
  }

  async restore({
    sharedSecret,
  }) {
    if (sharedSecret) {
      if (!this.sharedSecretNotesMap.has(sharedSecret)) {
        const note = await restoreFromSharedSecret(sharedSecret);
        this.sharedSecretNotesMap.set(sharedSecret, note);
      }

      return this.sharedSecretNotesMap.get(sharedSecret);
    }

    return null;
  }

  async sum(notes) {
    if (!notes) {
      return 0;
    }

    let sum = 0;
    await asyncForEach(notes, async (noteData) => {
      const note = await this.restore(noteData);
      sum += valueOf(note);
    });

    return sum;
  }

  async decryptNoteValue(sharedSecret) {
    if (!this.sharedSecretValueMap.has(sharedSecret)) {
      const value = await decryptNoteValue({
        encryptedViewingKey: sharedSecret,
      });

      this.sharedSecretValueMap.set(sharedSecret, value);
    }

    return this.sharedSecretValueMap.get(sharedSecret);
  }
}

export default new NoteManager();
