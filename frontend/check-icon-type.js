const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'favicon.ico');
const buffer = fs.readFileSync(filePath);

const header = buffer.slice(0, 4).toString('hex');
console.log(`File: ${filePath}`);
console.log(`Header: ${header}`);

if (header === '89504e47') {
    console.log('Type: PNG');
} else if (header.startsWith('ffd8ff')) {
    console.log('Type: JPEG');
} else if (header === '00000100') {
    console.log('Type: ICO');
} else {
    console.log('Type: Unknown');
}
