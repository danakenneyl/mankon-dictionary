import { BaseEntry } from '@/types/Datatypes';

export interface BrowseWord {
  english: string;
  mankon: string;
  pos: string;
}

export default function alphabetize(data: BaseEntry[], isEnglish: boolean): Record<string, BrowseWord[]> {
  const groups: Record<string, BrowseWord[]> = {};
  // Mankon alphabet with multi-character letters
  const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "Dʒ", "E", "G", "Ɣ", "Ɨ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "V", "W", "Y", "Z", "Ʒ"];
  
  function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  }
  
  // Function to determine the first "letter" in Mankon
  function getMankonFirstLetter(word: string): string {
    const normalized = removeAccents(word).toUpperCase();
    
    // Check for digraphs/special characters at the beginning
    for (const letter of mankonAlphabet) {
      if (letter.length > 1 && normalized.startsWith(letter)) {
        return letter;
      }
    }
    
    // If no special character found, return first character
    return normalized[0] || '';
  }
  
  if (isEnglish) {
    // Handle English alphabetization
    for (const entry of data) {
      if (entry.englishWord.length) {
        for (const word of entry.englishWord) {
          const letter = removeAccents(word[0]).toUpperCase();
          const pair: BrowseWord = { english: word, mankon: entry.mankonWord, pos: entry.partOfSpeech };
          if (!groups[letter]) {
            groups[letter] = [];
          }
          groups[letter].push(pair);
        }
      }
    }
    
    // Sort English words alphabetically within each letter group
    for (const letter in groups) {
      groups[letter].sort((a, b) => 
        removeAccents(a.english).localeCompare(removeAccents(b.english))
      );
    }
  } else {
    // Handle Mankon alphabetization
    for (const entry of data) {
      if (entry.mankonWord.length) {
        // Use custom function to get first letter/character combination
        const letter = getMankonFirstLetter(entry.mankonWord);
        const english = entry.englishWord.join(', ') || '';
        const pair: BrowseWord = { english, mankon: entry.mankonWord, pos: entry.partOfSpeech };
        
        if (!groups[letter]) {
          groups[letter] = [];
        }
        groups[letter].push(pair);
      }
    }
    
    // Sort Mankon words according to their alphabet
    for (const letter in groups) {
      groups[letter].sort((a, b) => {
        const aNoAccent = removeAccents(a.mankon);
        const bNoAccent = removeAccents(b.mankon);
        return aNoAccent.localeCompare(bNoAccent);
      });
    }
    
    // Create a sorted result object based on Mankon alphabet order
    const sortedGroups: Record<string, BrowseWord[]> = {};
    mankonAlphabet.forEach(letter => {
      if (groups[letter]) {
        sortedGroups[letter] = groups[letter];
      }
    });
    
    // Add any remaining groups not in the Mankon alphabet
    for (const letter in groups) {
      if (!sortedGroups[letter]) {
        sortedGroups[letter] = groups[letter];
      }
    }
    
    return sortedGroups;
  }
  
  return groups;
}