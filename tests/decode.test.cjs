const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const {join} = require('node:path');

const core = readFileSync(join(__dirname, '../decoder.js'), 'utf8');
const decode = runInNewContext(core + '\ndecodeApproval');
const spender = 'a'.repeat(40);
const encode = value => '0x095ea7b3' + '0'.repeat(24) + spender + value.toString(16).padStart(64, '0');

test('decodes the spender and formats the demo exactly', () => {
  const result = decode(encode(1250000n), '6');
  assert.equal(result.spender, '0x' + spender);
  assert.equal(result.raw, '1250000');
  assert.equal(result.formatted, '1,25');
});
test('retains precision beyond Number.MAX_SAFE_INTEGER', () => {
  assert.equal(decode(encode(900719925474099312345n), '5').formatted, '9007199254740993,12345');
});
test('distinguishes exact max, near max and zero', () => {
  const max = (1n << 256n) - 1n;
  assert.equal(decode(encode(max)).kind, 'max');
  assert.equal(decode(encode(max - 1n)).kind, 'finite');
  assert.equal(decode(encode(0n), '6').formatted, '0');
});
test('supports uppercase and optional decimals', () => {
  assert.equal(decode(' ' + encode(1n).toUpperCase() + ' ').formatted, null);
  assert.equal(decode(encode(1n), '255').formatted.length, 257);
});
test('rejects an empty or malformed call', () => {
  for (const value of ['', '0xZZ', '0x095ea7b3', encode(1n) + '00', '0xa9059cbb' + encode(1n).slice(10)]) {
    assert.throws(() => decode(value));
  }
});
test('rejects nonzero ABI padding and invalid decimal counts', () => {
  assert.throws(() => decode(encode(1n).replace('095ea7b30', '095ea7b31')), /mal encodé/);
  for (const digits of ['-1', '256', '1.5', '1e2']) assert.throws(() => decode(encode(1n), digits));
});
