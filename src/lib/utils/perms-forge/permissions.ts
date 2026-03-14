export class Permission {
    // Internal state is just an integer (0-4095) representing the 12 bits
    // 4096 = 2^12
    private state: number;

    constructor(initialOctal = 0o755) {
        this.state = initialOctal;
    }

    get value(): number {
        return this.state;
    }

    set value(v: number) {
        this.state = Math.max(0, Math.min(0o7777, v));
    }

    // --- Helpers for individual bits ---

    private getBit(mask: number): boolean {
        return (this.state & mask) !== 0;
    }

    private setBit(mask: number, value: boolean) {
        if (value) {
            this.state |= mask;
        } else {
            this.state &= ~mask;
        }
    }

    // --- Public API for UI Binding ---

    // Special
    get suid(): boolean { return this.getBit(0o4000); }
    set suid(v: boolean) { this.setBit(0o4000, v); }

    get sgid(): boolean { return this.getBit(0o2000); }
    set sgid(v: boolean) { this.setBit(0o2000, v); }

    get sticky(): boolean { return this.getBit(0o1000); }
    set sticky(v: boolean) { this.setBit(0o1000, v); }

    // User
    get userRead(): boolean { return this.getBit(0o0400); }
    set userRead(v: boolean) { this.setBit(0o0400, v); }

    get userWrite(): boolean { return this.getBit(0o0200); }
    set userWrite(v: boolean) { this.setBit(0o0200, v); }

    get userExec(): boolean { return this.getBit(0o0100); }
    set userExec(v: boolean) { this.setBit(0o0100, v); }

    // Group
    get groupRead(): boolean { return this.getBit(0o0040); }
    set groupRead(v: boolean) { this.setBit(0o0040, v); }

    get groupWrite(): boolean { return this.getBit(0o0020); }
    set groupWrite(v: boolean) { this.setBit(0o0020, v); }

    get groupExec(): boolean { return this.getBit(0o0010); }
    set groupExec(v: boolean) { this.setBit(0o0010, v); }

    // Other
    get otherRead(): boolean { return this.getBit(0o0004); }
    set otherRead(v: boolean) { this.setBit(0o0004, v); }

    get otherWrite(): boolean { return this.getBit(0o0002); }
    set otherWrite(v: boolean) { this.setBit(0o0002, v); }

    get otherExec(): boolean { return this.getBit(0o0001); }
    set otherExec(v: boolean) { this.setBit(0o0001, v); }


    // --- String Representations ---

    get octal(): string {
        // Always return 3 or 4 digits.
        // If special bits are set, 4 digits. Else 3.
        const special = (this.state & 0o7000) >> 9;
        const u = (this.state & 0o0700) >> 6;
        const g = (this.state & 0o0070) >> 3;
        const o = (this.state & 0o0007);

        if (special > 0) {
            return `${special}${u}${g}${o}`;
        } else {
            return `${u}${g}${o}`;
        }
    }

    set octal(val: string) {
        // Parse "755", "0755", "1755"
        // Remove non-octal chars
        const clean = val.replace(/[^0-7]/g, '');
        if (clean.length > 0) {
            const num = parseInt(clean, 8);
            if (clean.length === 3 && num <= 0o777) {
                // If user typed 3 digits, assume no special bits, UNLESS input was like '007' which is ambiguous but standard is just reset special.
                // Actually if we just assign, special bits are lost if not in input?
                // Standard chmod 755 removes special bits usually? No, chmod 755 preserves them on some systems, but chmod 0755 clears them.
                // For a calculator, explicit input is best.
                this.state = num;
            } else if (clean.length === 4) {
                this.state = num;
            } else if (clean.length > 4) {
                // Take last 4
                this.state = parseInt(clean.slice(-4), 8);
            } else {
                this.state = num;
            }
        }
    }

    get symbolic(): string {
        // Directory char 'd' is not part of permission bits really, it's file type.
        // We will just return the permission string: -rwxrwxrwx
        // User
        let res = '';
        res += this.userRead ? 'r' : '-';
        res += this.userWrite ? 'w' : '-';
        if (this.suid) {
            res += this.userExec ? 's' : 'S';
        } else {
            res += this.userExec ? 'x' : '-';
        }

        // Group
        res += this.groupRead ? 'r' : '-';
        res += this.groupWrite ? 'w' : '-';
        if (this.sgid) {
            res += this.groupExec ? 's' : 'S';
        } else {
            res += this.groupExec ? 'x' : '-';
        }

        // Other
        res += this.otherRead ? 'r' : '-';
        res += this.otherWrite ? 'w' : '-';
        if (this.sticky) {
            res += this.otherExec ? 't' : 'T';
        } else {
            res += this.otherExec ? 'x' : '-';
        }

        return res;
    }

    // Basic symbolic parser (rwxr-xr-x)
    set symbolic(val: string) {
        // Very rough parser
        // Expected format: 9 or 10 chars. If 10, ignore first (file type).
        let s = val.trim();
        if (s.length === 10) s = s.substring(1);
        if (s.length !== 9) return; // Fail safe

        let newState = 0;

        // User
        if (s[0] === 'r') newState |= 0o0400;
        if (s[1] === 'w') newState |= 0o0200;
        if (s[2] === 'x') newState |= 0o0100;
        else if (s[2] === 's') newState |= (0o4000 | 0o0100); // SUID + Exec
        else if (s[2] === 'S') newState |= 0o4000; // SUID (no exec)

        // Group
        if (s[3] === 'r') newState |= 0o0040;
        if (s[4] === 'w') newState |= 0o0020;
        if (s[5] === 'x') newState |= 0o0010;
        else if (s[5] === 's') newState |= (0o2000 | 0o0010);
        else if (s[5] === 'S') newState |= 0o2000;

        // Other
        if (s[6] === 'r') newState |= 0o0004;
        if (s[7] === 'w') newState |= 0o0002;
        if (s[8] === 'x') newState |= 0o0001;
        else if (s[8] === 't') newState |= (0o1000 | 0o0001);
        else if (s[8] === 'T') newState |= 0o1000;

        this.state = newState;
    }

    get binary(): string {
        // 12 bits
        // Grouped by 3
        const s = this.state.toString(2).padStart(12, '0');
        // Special | User | Group | Other
        // Actually usually visualized as rwx rwx rwx (9 bits)
        // We can show full 12 bits or just 9.
        // Let's show 9 bits for permissions and mention special bits separately or integrated?
        // Let's return just raw 12 bits spaced: 000 111 101 101
        return s.replace(/(\d{3})(?=\d)/g, '$1 ');
    }

    public generateCommand(path: string, recursive: boolean): string {
        const opts = recursive ? '-R ' : '';
        return `chmod ${opts}${this.octal} ${path}`;
    }
}
