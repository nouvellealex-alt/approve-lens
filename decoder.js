'use strict';
const MAX_UINT256 = (1n << 256n) - 1n;

function decodeApproval(input, precision = '') {
  const data = input.trim().toLowerCase();
  if (!data) throw new Error('Colle les données de l’appel.');
  if (!/^0x[0-9a-f]+$/.test(data)) throw new Error('Utilise une valeur hexadécimale commençant par 0x.');
  if (!data.startsWith('0x095ea7b3')) throw new Error('Le sélecteur doit correspondre à approve(address,uint256).');
  if (data.length !== 138) throw new Error('Cet appel doit contenir exactement 68 octets.');
  if (!/^0{24}$/.test(data.slice(10, 34))) throw new Error('Le mot ABI de l’adresse est mal encodé.');
  const spender = '0x' + data.slice(34, 74);
  const value = BigInt('0x' + data.slice(74));
  const kind = value === MAX_UINT256 ? 'max' : value === 0n ? 'zero' : 'finite';
  const digits = precision.trim();
  if (digits && (!/^\d{1,3}$/.test(digits) || Number(digits) > 255)) {
    throw new Error('Les décimales doivent être un entier entre 0 et 255.');
  }
  const raw = value.toString();
  let formatted = null;
  if (digits && kind !== 'max') {
    const places = Number(digits);
    const padded = raw.padStart(places + 1, '0');
    const fractional = places ? padded.slice(-places).replace(/0+$/, '') : '';
    formatted = (places ? padded.slice(0, -places) : raw) + (fractional ? ',' + fractional : '');
  }
  return {spender, kind, raw, formatted};
}
