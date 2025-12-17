import fs from 'fs';
import path from 'path';

interface Participant {
    id: string;
    isim: string;
    soyisim: string;
    code: string;
    gender?: 'F' | 'M';
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

function generateMatches(allParticipants: Participant[]): Match[] {
    let matches: Match[] = [];
    let givers = [...allParticipants];
    let receivers = [...allParticipants];

    // Helper to remove participant from array
    const removeById = (arr: Participant[], id: string) => arr.filter(p => p.id !== id);
    const findByName = (name: string) => allParticipants.find(p => p.isim.toLowerCase().includes(name.toLowerCase()));

    // --- RULE 1: Fatime -> Elnur ---
    const fatime = findByName('Fatime');
    const elnur = findByName('Elnur');

    if (fatime && elnur) {
        matches.push({
            giverId: fatime.id,
            receiverId: elnur.id,
            receiverName: `${elnur.isim} ${elnur.soyisim}`
        });
        givers = removeById(givers, fatime.id);
        receivers = removeById(receivers, elnur.id);
    }

    // --- RULE 2: Elnur -> Ilkin ---
    const ilkin = findByName('Ilkin');

    if (elnur && ilkin) {
        matches.push({
            giverId: elnur.id,
            receiverId: ilkin.id,
            receiverName: `${ilkin.isim} ${ilkin.soyisim}`
        });
        givers = removeById(givers, elnur.id);
        receivers = removeById(receivers, ilkin.id);
    }

    // --- RULE 3: Woman -> Fatime ---
    // We need to find a woman from the remaining GIVERS to give to Fatime
    if (fatime) {
        const femaleGivers = givers.filter(p => p.gender === 'F' && p.id !== fatime.id); // Cannot be Fatime herself (already removed from givers anyway)

        if (femaleGivers.length === 0) {
            throw new Error("No available female givers for Fatime!");
        }

        // Pick random female
        const randomFemale = femaleGivers[Math.floor(Math.random() * femaleGivers.length)];

        matches.push({
            giverId: randomFemale.id,
            receiverId: fatime.id,
            receiverName: `${fatime.isim} ${fatime.soyisim}`
        });

        givers = removeById(givers, randomFemale.id);
        receivers = removeById(receivers, fatime.id);
    }

    // --- REMAINING MATCHES ---
    // Simple retry logic for the rest
    let attempts = 0;
    while (true) {
        attempts++;
        if (attempts > 1000) throw new Error("Could not find valid matches after 1000 attempts");

        let currentGivers = [...givers];
        let currentReceivers = shuffleArray([...receivers]);
        let tempMatches: Match[] = [];
        let valid = true;

        for (let i = 0; i < currentGivers.length; i++) {
            // Validation: Cannot give to self
            if (currentGivers[i].id === currentReceivers[i].id) {
                valid = false;
                break;
            }

            // Add constraint check here if needed (e.g. no couples)

            tempMatches.push({
                giverId: currentGivers[i].id,
                receiverId: currentReceivers[i].id,
                receiverName: `${currentReceivers[i].isim} ${currentReceivers[i].soyisim}`
            });
        }

        if (valid) {
            matches = [...matches, ...tempMatches];
            break;
        }
    }

    return matches;
}

try {
    const matches = generateMatches(participants);
    fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
    console.log(`Successfully generated ${matches.length} matches in ${matchesPath}`);
} catch (e) {
    console.error("Error generating matches:", e);
}
