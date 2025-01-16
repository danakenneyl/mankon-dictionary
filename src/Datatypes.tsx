export interface MankonWordInfo {
    mankon: string;
    english: string;
    pos: string;
    pronunciation: string[];
    definition: string;
    sentencesMankon: string[];
    sentencesEnglish: string[];
    sentencesPronunciation: string[];
  }
export interface JsonData {
    data: MankonWordInfo[];
}

export interface SearchParams {
    data : MankonWordInfo[];
    searchEng: boolean;
    setSearchEng: React.Dispatch<React.SetStateAction<boolean>>;
}