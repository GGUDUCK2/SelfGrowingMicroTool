import { dictionaries } from './dictionaries';

export function getDictionary(lang: string) {
    return dictionaries[lang as keyof typeof dictionaries] || dictionaries['en'];
}
