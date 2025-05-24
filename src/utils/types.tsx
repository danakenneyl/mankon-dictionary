export interface WordEntry {
    altSpelling: string;
    contributorUUID: string[];
    createdAt: string;
    lastModifiedAt: string;
    mankonSentences: string[];
    mankonWord: string;
    pairWords?: string[];
    sentenceAudioFileIds: string[];
    sentenceAudioFilenames: string[];
    translatedSentences: string[];
    translatedWords: string[];
    type: string;
    wordAudioFileIds: string[];
    wordAudioFilenames: string[];
    status: string;
    partOfSpeech: string;
    nounClass?: string;
    case?: string;
  }

export interface WordProposal {
    altSpelling?: string;
    contributorUUID?: string[];
    createdAt: string;
    lastModifiedAt: string;
    mankonSentences?: string[];
    mankonWord: string;
    pairWords?: string[];
    sentenceAudioFileIds?: string[];
    sentenceAudioFilenames?: string[];
    translatedSentences?: string[];
    translatedWords?: string[];
    type?: string;
    wordAudioFileIds?: string[];
    wordAudioFilenames?: string[];
    status: string;
    partOfSpeech?: string;
    nounClass?: string;
    case?: string;
  }

export interface Contributor {
    contribution: string[];
    createdAt: string;
    lastModifiedAt: string;
    password: string;
    username: string;
    role: string;
}