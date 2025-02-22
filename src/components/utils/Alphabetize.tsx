import { MankonWordInfo } from '@/components/types/Datatypes';

export interface BrowseWord {
  english?: string;
  mankon: string;
  pos: string;
}

export default function alphabetize(data: MankonWordInfo[], isEnglish: boolean): Record<string, BrowseWord[]> {
  const groups: Record<string, BrowseWord[]> = {};

  if (isEnglish) {
    for (const entry of data) {
      if (entry.english?.length) {
        for (const word of entry.english) {
          const letter = word[0].toUpperCase();
          const pair: BrowseWord = { english: word, mankon: entry.mankon, pos: entry.posENG };

          if (!groups[letter]) {
            groups[letter] = [];
          }
          groups[letter].push(pair);
        }
      }
    }
  } else {
    for (const entry of data) {
      if (entry.mankon?.length) {
        const letter = entry.mankon[0].toUpperCase();
        const english = entry.english?.join(', ') || 'Unknown';
        const pair: BrowseWord = { english, mankon: entry.mankon, pos: entry.posENG };

        if (!groups[letter]) {
          groups[letter] = [];
        }
        groups[letter].push(pair);
      }
    }
  }

  return groups;
}

