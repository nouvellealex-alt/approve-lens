'use strict';
if (location.protocol === 'chrome-extension:') document.body.classList.add('popup');
const byId = id => document.getElementById(id);
const titles = {max:'Valeur maximale uint256',zero:'Valeur nulle',finite:'Montant encodé'};
const summaries = {
  max:'Pour un ERC-20, cette valeur correspond généralement à une autorisation sans limite.',
  zero:'Pour un ERC-20, cet appel demande de ramener l’autorisation de cette adresse à zéro.',
  finite:'Pour un ERC-20, cet appel demande de fixer l’autorisation à cette valeur.'
};
function reset() {
  byId('output').classList.remove('result');
  byId('title').textContent = 'Ton résultat s’affichera ici';
  byId('summary').textContent = 'L’analyse se fait dans cette page, même sans connexion.';
  byId('details').hidden = true;
  byId('error').textContent = '';
}
function render() {
  reset();
  try {
    const decoded = decodeApproval(byId('data').value, byId('decimals').value);
    byId('title').textContent = titles[decoded.kind];
    byId('summary').textContent = summaries[decoded.kind];
    byId('spender').textContent = decoded.spender;
    byId('raw').textContent = decoded.raw;
    byId('formatted').textContent = decoded.formatted ?? '';
    byId('formatted').hidden = byId('formattedLabel').hidden = decoded.formatted === null;
    byId('details').hidden = false;
    byId('output').classList.add('result');
  } catch (error) {
    byId('error').textContent = error.message;
  }
}
byId('form').addEventListener('input', reset);
byId('form').addEventListener('submit', event => { event.preventDefault(); render(); });
byId('demo').addEventListener('click', () => {
  byId('data').value = '0x095ea7b3' + '0'.repeat(24) + '1'.repeat(40) + (1250000n).toString(16).padStart(64, '0');
  byId('decimals').value = '6';
  render();
});
