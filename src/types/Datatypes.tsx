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

export interface DemographicData {
  UUID: string;
  age: string;
  location: string;
  diaspora: boolean;
  spokenLanguage: string;
  currentLanguage: string;
  childhoodLanguage: string;
  yearsSpeaking: number;
  learnSpeechModality: string;
  speechProficiency: string;
  writeProficiency: string;
  readProficiency: string;
  createdAt: string;
  lastModifiedAt: string;
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
