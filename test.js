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

const startTime = Date.now();
const nonce = bitcoin.proofOfWork(parentHash, currentBlockData);
const endTime = Date.now();

console.log('\nProof of Work 완료!');
console.log('Nonce:', nonce);
console.log('소요 시간:', (endTime - startTime) + 'ms');

// 찾은 nonce로 해시 생성
const blockHash = bitcoin.hashBlock(parentHash, currentBlockData, nonce);
console.log('Block Hash:', blockHash);
console.log('Hash가 0000으로 시작하는가?', blockHash.substring(0, 4) === '0000');

console.log('\n5. POW로 블록 생성');
console.log('-------------------');

bitcoin.createNewBlock(parentHash, blockHash, nonce);
console.log('Block 2:', bitcoin.chain[2]);
console.log('Chain length:', bitcoin.chain.length);

console.log('\n6. 해시 함수 테스트');
console.log('-------------------');

const testParentHash = 'testParentHash123456';
const testData = [
  { amount: 100, sender: 'Alice', recipient: 'Bob' },
  { amount: 200, sender: 'Bob', recipient: 'Charlie' }
];
const testNonce = 5000;

const hash1 = bitcoin.hashBlock(testParentHash, testData, testNonce);
console.log('Hash 1:', hash1);

// 데이터를 약간 변경
testData[0].amount = 101;
const hash2 = bitcoin.hashBlock(testParentHash, testData, testNonce);
console.log('Hash 2 (amount를 1만 변경):', hash2);
console.log('두 해시가 다른가?', hash1 !== hash2);

// 원래 데이터로 복구
testData[0].amount = 100;
const hash3 = bitcoin.hashBlock(testParentHash, testData, testNonce);
console.log('Hash 3 (원래 데이터):', hash3);
console.log('Hash 1과 Hash 3이 같은가?', hash1 === hash3);

console.log('\n7. 체인 유효성 검증');
console.log('-------------------');

// 더 많은 블록 생성
