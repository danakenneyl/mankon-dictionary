import { BaseEntry } from '@/components/types/Datatypes';

export interface BrowseWord {
  english: string;
  mankon: string;
  pos: string;
}

export default function alphabetize(data: BaseEntry[], isEnglish: boolean): Record<string, BrowseWord[]> {
  const groups: Record<string, BrowseWord[]> = {};

  if (isEnglish) {
    for (const entry of data) {
      if (entry.englishWord.length) {
        for (const word of entry.englishWord) {
          const letter = word[0].toUpperCase();
          const pair: BrowseWord = { english: word, mankon: entry.mankonWord, pos: entry.partOfSpeech };

          if (!groups[letter]) {
            groups[letter] = [];
          }
          groups[letter].push(pair);
        }
      }
    }
  } else {
    for (const entry of data) {
      if (entry.mankonWord.length) {
        const letter = entry.mankonWord.toUpperCase();
        const english = entry.englishWord.join(', ') || '';
        const pair: BrowseWord = { english, mankon: entry.mankonWord, pos: entry.partOfSpeech };

        if (!groups[letter]) {
          groups[letter] = [];
        }
        groups[letter].push(pair);
      }
    }
  }

  return groups;
}

