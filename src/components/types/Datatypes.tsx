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

export interface SearchParams {
  data: BaseEntry[];
}

export type DriveFilesResponse = {
  jsonFiles: DriveFile[];
  error?: string;
};

export type DriveFile = {
  id: string;
  name: string;
};

export interface DemographicFormData {
  age: number;
  location: string[];
  languagesSpoken: string[];
  currentLanguages: string[];
  childhoodLanguages: string[];
  readingProficiency: number;
  writingProficiency: number;
  id: number;
}