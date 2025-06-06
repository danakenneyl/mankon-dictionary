export interface ContributorCollection {
  [key: string]: Contributor;
}
export interface EntryCollection {
  [key: string]: WordEntry;
}
export interface DemographicCollection {
  [key: string]: Demographics;
}

export interface WordEntry {
  altSpelling?: string;
  contributorUUIDs?: string[];
  createdAt: string;
  lastModifiedAt: string;
  mankonSentences?: string[];
  mankonWord: string;
  pairWords?: string[];
  sentenceAudioFileIds?: string[];
  sentenceAudioFilenames?: string[];
  translatedSentences?: string[];
  translatedWords?: string[];
  type?: string[];
  wordAudioFileIds?: string[];
  wordAudioFilenames?: string[];
  status: string;
  partOfSpeech?: string;
}

export interface Noun extends WordEntry {
  nounClass?: string;
  case?: string;
}

export interface Contributor {
    contribution: string[];
    createdAt: string;
    lastModifiedAt: string;
    password: string;
    username: string;
    role: "contributor" | "administrator";
}

export interface Demographics {
  UUID: string;
  name: string;
  email: string;
  phoneNumber: string;
  consentReceived: boolean;
  age: string;
  location: string;
  diaspora: boolean;
  spokenLanguage: string[];
  currentLanguage: string[];
  childhoodLanguage: string[];
  yearsSpeaking: string;
  learnSpeechModality: string;
  speechProficiency: string;
  writeProficiency: string;
  readProficiency: string;
  createdAt: string;
  lastModifiedAt: string;
}



