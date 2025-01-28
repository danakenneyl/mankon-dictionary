import { MankonWordInfo } from '../Datatypes';

export interface browseWord {
  english?:string;
  mankon:string;
  pos:string;
}

export function alphabetize(data: MankonWordInfo[], isEnglish: boolean): Record<string, browseWord[]> {
    const groups: Record<string, browseWord[]> = {}; 
    // Sort for English 
    if (isEnglish) {
      console.log("I should not appear with you");
      // iterate through all entries
      for (const entry of data) {
        if (entry["english"] && entry["english"].length > 0) {
          // if entry has single english entry add pair to Record
          if (entry["english"].length === 1) {
            const letter = entry["english"][0][0].toUpperCase();
            const pair: browseWord = { english: entry["english"][0], mankon: entry["mankon"], pos: entry["posENG"] };
            if (letter in groups) {
              groups[letter].push(pair)
            }
            else {
              groups[letter] = [pair];
            }
          // if entry has multiple english entry add all english words with their own mankon word to the Record
          } else {
            for (const word of entry["english"]) {
              const letter = word[0].toUpperCase();
              const pair: browseWord = { english: word, mankon: entry["mankon"], pos: entry["posENG"] };
              if (letter in groups) {
                groups[letter].push(pair)
              }
              else {
                groups[letter] = [pair];
              }
            }
          }
        } 
      }
    // Sort for Mankon
    } else {
      console.log("I shouldn't appear at all");
      // iterate through all entries
      for (const entry of data) {
        if (entry["english"] && entry["english"].length > 0) {
          const letter = entry["mankon"][0].toUpperCase(); 
          // format english list into single string
          const english = entry["english"].join(", ");
          const pair: browseWord = { english: english, mankon: entry["mankon"], pos: entry["posENG"] };
          // add english and mankon pair to Record
          if (letter in groups) {
          groups[letter].push(pair)
          }
          else {
          groups[letter] = [pair];
          }
        }
      }
    }
    return groups;
  }