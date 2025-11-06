// Username Generator - Provides random fantasy-style usernames
// This module generates random usernames for players

class UsernameGenerator {
    constructor() {
        // Fantasy name components inspired by Magic the Gathering
        this.prefixes = [
            'Dark', 'Shadow', 'Swift', 'Iron', 'Gold', 'Silver', 'Fire',
            'Ice', 'Storm', 'Night', 'Blood', 'Soul', 'Death', 'Light',
            'Thunder', 'Dragon', 'Wolf', 'Raven', 'Steel', 'Ancient',
            'Vorinclex', 'Elesh', 'Urza', 'Jace', 'Chandra', 'Liliana',
            'Gideon', 'Ajani', 'Nissa', 'Teferi', 'Sorin', 'Karn',
            'Nicol', 'Ugin', 'Garruk', 'Tezzeret', 'Sarkhan', 'Nahiri',
            'Koth', 'Vraska', 'Tamiyo', 'Ob', 'Ashiok', 'Xenagos',
            'Kiora', 'Domri', 'Dack', 'Venser', 'Kaya', 'Arlinn',
            'Ethereal', 'Planar', 'Arcane', 'Mystic', 'Void', 'Primal',
            'Eternal', 'Cosmic', 'Serra', 'Phyrexian', 'Mirrodin', 'Zendikar',
            'Ravnica', 'Innistrad', 'Dominaria', 'Kamigawa', 'Theros', 'Eldraine'
        ];
        
        this.suffixes = [
            'blade', 'fist', 'heart', 'walker', 'slayer', 'hunter', 'keeper',
            'bringer', 'seeker', 'striker', 'master', 'lord', 'knight', 'mage',
            'ranger', 'warrior', 'smith', 'crafter', 'runner', 'breaker',
            'touched', 'born', 'sworn', 'caller', 'speaker', 'weaver',
            'binder', 'shaper', 'forge', 'guard', 'warden', 'champion',
            'sage', 'prophet', 'herald', 'voice', 'hand', 'eye',
            'mind', 'will', 'force', 'power', 'might', 'rage',
            'fury', 'wrath', 'vengeance', 'justice', 'mercy', 'hope',
            'dream', 'vision', 'omen', 'fate', 'destiny', 'legacy'
        ];
        
        this.numbers = [
            '', '', '', '1', '2', '3', '7', '13', '21', '42', '69', '99', '420', '666', '777', '1337'
        ];
    }

    /**
     * Generate a random username
     * @returns {string} - A random fantasy username
     */
    generate() {
        const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
        const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
        const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
        
        return `${prefix}${suffix}${number}`;
    }

    /**
     * Generate a UUID v4
     * @returns {string} - A unique identifier
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Export the username generator
const usernameGenerator = new UsernameGenerator();
