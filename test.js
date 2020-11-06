const Blockchain = require('./blockchain');

console.log('\n========================================');
console.log('Bitcoin POW Blockchain Demo - Test Suite');
console.log('========================================\n');

// 블록체인 인스턴스 생성
const bitcoin = new Blockchain();

console.log('1. Genesis Block 확인');
console.log('-------------------');
console.log('Genesis Block:', bitcoin.chain[0]);
console.log('Chain length:', bitcoin.chain.length);

console.log('\n2. 트랜잭션 생성');
console.log('-------------------');
