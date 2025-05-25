import { EntryCollection } from "@/utils/types";

export default function RenderProposalsInterface({filteredEntries, state}: {filteredEntries: EntryCollection; state: string}) {
    return (
        <div>
            {Object.entries(filteredEntries).map(([id, entry]) => (
                <div key={id} className="content-card">
                    {state === "Initial Proposals" && (
                        <div className="initial-proposal-card">
                            <h3 className="text-2xl font-bold mb-4">{entry.mankonWord}</h3>
                            {entry.partOfSpeech && <p className="text-lg mb-2">Part of Speech: {entry.partOfSpeech}</p>}
                            {entry.altSpelling && <p className="text-lg mb-2">Alternate Spellings: {entry.altSpelling}</p>}
                            {entry.translatedWords && <p className="text-lg mb-2">Translation(s): {entry.translatedWords.join(", ")}</p>}
                            {entry.mankonSentences && <p className="text-lg mb-2">Mankon Sentences: {entry.mankonSentences.join(", ")}</p>}
                            {entry.translatedSentences && <p className="text-lg mb-2">Sentence Translations: {entry.translatedSentences.join(", ")}</p>}
                            {entry.wordAudioFilenames && <p className="text-lg mb-2">Word Audio Files: {entry.wordAudioFilenames}</p>}
                            {entry.sentenceAudioFilenames && <p className="text-lg mb-2">Sentence Audio Files: {entry.sentenceAudioFilenames.join(", ")}</p>}
                            {entry.pairWords && <p className="text-lg mb-2">Related Word(s): {entry.pairWords.join(", ")}</p>}
                            {entry.contributorUUIDs && <p className="text-lg mb-2">Contributor: {entry.contributorUUIDs.join(", ")}</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

}
