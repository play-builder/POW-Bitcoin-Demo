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

// 트랜잭션 생성
bitcoin.createNewTransaction(100, 'ALICE_ADDRESS_123', 'BOB_ADDRESS_456');
bitcoin.createNewTransaction(50, 'BOB_ADDRESS_456', 'CHARLIE_ADDRESS_789');
bitcoin.createNewTransaction(200, 'CHARLIE_ADDRESS_789', 'ALICE_ADDRESS_123');

console.log('Pending Transactions:', bitcoin.pendingTxs.length);
console.log('Transactions:', bitcoin.pendingTxs);

console.log('\n3. 블록 생성 (간단한 방법)');
console.log('-------------------');

// 임의의 값으로 블록 생성
bitcoin.createNewBlock('parentHash123', 'hash456', 1000);
console.log('Block 1:', bitcoin.chain[1]);
console.log('Chain length:', bitcoin.chain.length);

console.log('\n4. Proof of Work 테스트');
console.log('-------------------');

const parentHash = bitcoin.getLastBlock()['hash'];

// 새로운 트랜잭션 추가
bitcoin.createNewTransaction(300, 'DAVE_ADDRESS_ABC', 'EVE_ADDRESS_DEF');

const currentBlockData = {
  transactions: bitcoin.pendingTxs,
  index: bitcoin.chain.length
};

console.log('Proof of Work 시작...');
console.log('Parent Hash:', parentHash);
console.log('Current Block Data:', currentBlockData);
