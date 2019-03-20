import * as fs from 'fs';
import * as child from 'child_process';
import * as assert from 'assert';

const md: string = fs.readFileSync('README.template.md', 'utf8');
const examples: Array<string> = [];
fs.writeFileSync('README.md', md.replace(/^>>(.*)/mg, (match, file) => {
    const m = file.trim();
    const example: any = fs.readFileSync('./' + m, 'utf8');
    const runner = example.split("\n")[0].match(/\/\/(.*)/)[1];
    assert(runner, 'missing runner command');
    examples.push(runner.trim());
    return example;
}));

examples.forEach(example => {
    console.log('testing ' + example)
    child.execSync(example);
});
