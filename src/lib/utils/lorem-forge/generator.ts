export type DictionaryType = 'standard' | 'corporate' | 'tech' | 'hangul';
export type TargetType = 'paragraphs' | 'words' | 'characters' | 'bytes';
export type FormatType = 'plain' | 'html' | 'markdown';

export interface GenerateOptions {
    dictionary: DictionaryType;
    targetType: TargetType;
    count: number;
    format: FormatType;
    startWithLorem: boolean;
}

const dictionaries = {
    standard: [
        "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
        "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
        "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
        "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
        "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint",
        "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit",
        "anim", "id", "est", "laborum"
    ],
    corporate: [
        "synergy", "leverage", "paradigm", "shift", "robust", "scalable", "agile", "holistic",
        "proactive", "bandwidth", "ecosystem", "disruptive", "innovation", "alignment", "stakeholders",
        "core", "competency", "deliverables", "empower", "metrics", "touchbase", "wheelhouse", "actionable",
        "insights", "strategic", "initiative", "traction", "seamless", "integration", "optimize", "pivot"
    ],
    tech: [
        "algorithm", "bandwidth", "backend", "frontend", "cache", "cloud", "compile", "container",
        "deploy", "docker", "encryption", "endpoint", "framework", "git", "hash", "latency", "microservices",
        "node", "nosql", "pipeline", "kubernetes", "react", "repo", "scalable", "serverless", "token",
        "webhook", "websocket", "xml", "json", "yaml", "devops", "ci/cd", "agile", "sprint"
    ],
    hangul: [
        "대한민국", "헌법", "제1조", "민주공화국", "주권", "국민", "권력", "자유", "평등", "권리",
        "의무", "법률", "보장", "국가", "안전보장", "질서유지", "공공복리", "제한", "본질적", "내용",
        "침해", "대통령", "국회", "정부", "법원", "헌법재판소", "선거", "정당", "지방자치", "경제",
        "성장", "발전", "행복", "추구권", "인간", "존엄", "가치"
    ]
};

export class LoremGenerator {
    private getRandomWord(dict: DictionaryType): string {
        const words = dictionaries[dict];
        return words[Math.floor(Math.random() * words.length)];
    }

    private capitalize(word: string): string {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    private generateSentence(dict: DictionaryType, minWords = 5, maxWords = 15): string {
        const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
        const words: string[] = [];

        for (let i = 0; i < wordCount; i++) {
            words.push(this.getRandomWord(dict));
        }

        // Add commas randomly (max 2 per sentence)
        if (wordCount > 6) {
            const numCommas = Math.floor(Math.random() * 3);
            for (let i = 0; i < numCommas; i++) {
                const pos = Math.floor(Math.random() * (wordCount - 3)) + 1;
                words[pos] += ',';
            }
        }

        const sentence = words.join(' ') + '.';
        return this.capitalize(sentence);
    }

    private generateParagraph(dict: DictionaryType, minSentences = 3, maxSentences = 7): string {
        const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
        const sentences: string[] = [];
        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(this.generateSentence(dict));
        }
        return sentences.join(' ');
    }

    private formatOutput(paragraphs: string[], format: FormatType): string {
        if (format === 'html') {
            return paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
        } else if (format === 'markdown') {
            // For markdown we'll just add double newlines, but we could add ### or lists if we wanted.
            return paragraphs.join('\n\n');
        }
        return paragraphs.join('\n\n');
    }

    public generate(options: GenerateOptions): string {
        const paragraphs: string[] = [];
        const dict = options.dictionary;
        const count = Math.max(1, options.count); // Ensure at least 1
        let currentText = '';

        if (options.startWithLorem && dict === 'standard') {
            // Special handling for classic lorem ipsum
            const loremStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
            if (options.targetType === 'paragraphs') {
                paragraphs.push(loremStart + this.generateParagraph(dict, 2, 6));
            } else {
                currentText = loremStart;
            }
        }

        if (options.targetType === 'paragraphs') {
            while (paragraphs.length < count) {
                paragraphs.push(this.generateParagraph(dict));
            }
            return this.formatOutput(paragraphs, options.format);
        }

        if (options.targetType === 'words') {
            const words: string[] = currentText ? currentText.trim().split(/\s+/) : [];
            while (words.length < count) {
                words.push(this.getRandomWord(dict));
            }

            // Format into sentences/paragraphs
            let result = '';
            let wordIndex = 0;
            const wordsToUse = words.slice(0, count);

            while (wordIndex < wordsToUse.length) {
                let paragraphWords = wordsToUse.slice(wordIndex, wordIndex + 50);
                if (paragraphWords.length > 0) {
                     // Very basic sentence structuring
                     let pText = this.capitalize(paragraphWords.join(' ')) + '.';
                     paragraphs.push(pText);
                }
                wordIndex += 50;
            }
            return this.formatOutput(paragraphs, options.format);
        }

        if (options.targetType === 'characters' || options.targetType === 'bytes') {
            let result = currentText;

            const checkLimit = (text: string) => {
                if (options.targetType === 'bytes') {
                    return new TextEncoder().encode(text).length >= count;
                }
                return text.length >= count;
            };

            const truncateLimit = (text: string) => {
                if (options.targetType === 'bytes') {
                    const encoder = new TextEncoder();
                    const decoder = new TextDecoder('utf-8');
                    let encoded = encoder.encode(text);
                    if (encoded.length > count) {
                        return decoder.decode(encoded.slice(0, count)).replace(/\uFFFD/g, ''); // Remove replacement chars
                    }
                    return text;
                }
                return text.slice(0, count);
            };

            while (!checkLimit(result)) {
                // Add a word and space
                result += (result.length > 0 && !result.endsWith(' ') ? ' ' : '') + this.getRandomWord(dict);
            }

            // We may have overshot, so truncate exactly
            result = truncateLimit(result);
            return result;
        }

        return '';
    }
}
