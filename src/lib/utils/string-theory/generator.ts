export class TextGenerator {
    static loremIpsum(paragraphs: number = 3): string {
        const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        return Array(paragraphs).fill(lorem).join('\n\n');
    }

    static randomString(length: number, options: { numbers?: boolean, symbols?: boolean, uppercase?: boolean } = {}): string {
        const { numbers = true, symbols = false, uppercase = true } = options;
        let chars = 'abcdefghijklmnopqrstuvwxyz';
        if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (numbers) chars += '0123456789';
        if (symbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static uuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
