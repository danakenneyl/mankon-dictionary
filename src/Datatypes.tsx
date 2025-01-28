export interface JsonData {
  data: MankonWordInfo[];
}
export interface MankonWordInfo {
  mankon: string;
  english: string[];
  posMANK: string;
  posENG: string;
  classSING: string;
  classPLUR: string;
  pronunciation: string[];
  pair: string;
  sentencesMANK: string[];
  sentencesENG: string[];
  sentencesPRON: string[];
}
export interface SearchParams {
  data : MankonWordInfo[];
  searchEng: boolean;
  setSearchEng: React.Dispatch<React.SetStateAction<boolean>>;
}
