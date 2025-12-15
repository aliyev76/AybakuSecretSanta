import fs from 'fs';
import path from 'path';

interface Participant {
    id: string;
    isim: string;
    soyisim: string;
    code: string;
}

interface Match {
    giverId: string;
    receiverId: string;
    receiverName: string;
}

// Using process.cwd() is safer when running from project root
const dataDir = path.join(process.cwd(), 'netlify/functions/data');
const participantsPath = path.join(dataDir, 'participants.json');
const matchesPath = path.join(dataDir, 'matches.json');

const participants: Participant[] = JSON.parse(fs.readFileSync(participantsPath, 'utf-8'));

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateMatches(participants: Participant[]): Match[] {
    let givers = [...participants];
    let receivers = [...participants];
    let matches: Match[] = [];

    // Simple retry logic
    while (true) {
        receivers = shuffleArray([...participants]);
        let valid = true;
        for (let i = 0; i < givers.length; i++) {
            if (givers[i].id === receivers[i].id) {
                valid = false;
                break;
            }
        }
        if (valid) break;
    }

    for (let i = 0; i < givers.length; i++) {
        matches.push({
            giverId: givers[i].id,
            receiverId: receivers[i].id,
            receiverName: `${receivers[i].isim} ${receivers[i].soyisim}`
        });
    }

    return matches;
}

const matches = generateMatches(participants);

fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));

console.log(`Successfully generated ${matches.length} matches in ${matchesPath}`);
