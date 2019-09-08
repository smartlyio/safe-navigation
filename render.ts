import * as fs from 'fs';
import * as child from 'child_process';
import * as assert from 'assert';
import * as util from 'util';

const md: string = fs.readFileSync('README.template.md', 'utf8');
const examples: string[] = [];
fs.writeFileSync(
  'README.md',
  md.replace(/^>>(.*)/gm, (match, file) => {
    const m = file.trim();
    const example: any = fs.readFileSync('./' + m, 'utf8');
    const runner = example.split('\n')[0].match(/\/\/(.*)/)[1];
    assert(runner, 'missing runner command');
    examples.push(runner.trim());
    return example;
  })
);

// tslint:disable-next-line:no-floating-promises
Promise.all(
  examples.map(example => {
    // tslint:disable-next-line:no-console
    console.log('testing ' + example);
    return util.promisify(child.exec)(example);
  })
);
