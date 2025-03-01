export interface BaseEntry {
  mankonWord: string;
  pronunciation: string[];
  englishWord: string[];
  partOfSpeech: string;
  mankonSentence: string[];
  englishSentence: string[];
  sentenceRecording: string[];
  pair: string[];
  contributor: number[];
}
export interface NounEntry extends BaseEntry {
  singleClass: number;
  pluralClass: number;
}

// export interface VerbEntry extends BaseEntry{}

// export interface AdjectiveEntry extends BaseEntry{}

// export type DictionaryEntry = NounEntry | VerbEntry | AdjectiveEntry;

export interface DemographicInfo {
  age: number;
  location: [];
  languagesSpoken: [];
  currentLanguages: [];
  childhoodLanguages: [];
  readingProficiency: number,
  writingProficiency: number,
  contributor: number
}