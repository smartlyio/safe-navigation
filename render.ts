import * as fs from 'fs';
import * as child from 'child_process';

const md: string = fs.readFileSync('README.template.md', 'utf8');
const examples: Array<string> = [];
fs.writeFileSync('README.md', md.replace(/^>>(.*)/mg, (match, file) => {
    const m = file.trim();
    examples.push(m);
    return fs.readFileSync('./' + m, 'utf8');
}));

examples.forEach(example => {
    console.log('testing ' + example)
    child.execSync('yarn ts-node ' + example);
});
