// examples.js - 블록체인 사용 예제 모음

const Blockchain = require('./blockchain');

console.log('\n==============================================');
console.log('  Bitcoin POW Blockchain - Usage Examples');
console.log('==============================================\n');

const bitcoin = new Blockchain();

// ============================================
// 예제 1: 기본 블록 생성
// ============================================
console.log('📦 예제 1: 기본 블록 생성\n');

console.log('1-1. Genesis Block 확인:');
console.log(bitcoin.getLastBlock());

console.log('\n1-2. 간단한 블록 추가 (임의의 값):');
bitcoin.createNewBlock('hash1', 'hash2', 1000);
console.log('블록 개수:', bitcoin.chain.length);

// ============================================
// 예제 2: 트랜잭션 생성
// ============================================
console.log('\n\n💸 예제 2: 트랜잭션 생성\n');

console.log('2-1. 여러 트랜잭션 생성:');
const tx1 = bitcoin.createNewTransaction(100, 'Alice', 'Bob');
const tx2 = bitcoin.createNewTransaction(50, 'Bob', 'Charlie');
const tx3 = bitcoin.createNewTransaction(200, 'Charlie', 'Dave');

console.log('트랜잭션 1:', tx1);
console.log('트랜잭션 2:', tx2);
console.log('트랜잭션 3:', tx3);

console.log('\n2-2. Pending 트랜잭션에 추가:');
bitcoin.addTransactionToPendingTransactions(tx1);
bitcoin.addTransactionToPendingTransactions(tx2);
bitcoin.addTransactionToPendingTransactions(tx3);
console.log('대기 중인 트랜잭션:', bitcoin.pendingTxs.length);

// ============================================
// 예제 3: Proof of Work 실습
// ============================================
console.log('\n\n⛏️ 예제 3: Proof of Work 실습\n');

const lastBlock = bitcoin.getLastBlock();
const parentHash = lastBlock.hash;
const currentBlockData = {
  transactions: bitcoin.pendingTxs,
  index: lastBlock.index + 1
};

console.log('3-1. POW 시작...');
console.log('Parent Hash:', parentHash);
console.log('Transactions:', currentBlockData.transactions.length);

const startTime = Date.now();
const nonce = bitcoin.proofOfWork(parentHash, currentBlockData);
const endTime = Date.now();

console.log('\n3-2. POW 완료!');
console.log('찾은 Nonce:', nonce.toLocaleString());
console.log('소요 시간:', (endTime - startTime).toLocaleString(), 'ms');

const blockHash = bitcoin.hashBlock(parentHash, currentBlockData, nonce);
console.log('블록 Hash:', blockHash);
console.log('0000으로 시작?', blockHash.substring(0, 4) === '0000' ? '✅' : '❌');

console.log('\n3-3. 블록 생성:');
bitcoin.createNewBlock(parentHash, blockHash, nonce);
console.log('현재 체인 길이:', bitcoin.chain.length);

// ============================================
// 예제 4: 해시 함수의 특성
// ============================================
console.log('\n\n🔐 예제 4: 해시 함수의 특성 (눈사태 효과)\n');

const testData = {
  transactions: [{ amount: 100, sender: 'A', recipient: 'B' }],
  index: 1
};

console.log('4-1. 원본 데이터:');
const hash1 = bitcoin.hashBlock('parentHash123', testData, 5000);
console.log('Hash:', hash1);

console.log('\n4-2. 금액을 1만 변경 (100 → 101):');
testData.transactions[0].amount = 101;
const hash2 = bitcoin.hashBlock('parentHash123', testData, 5000);
console.log('Hash:', hash2);
console.log('해시가 변경됨:', hash1 !== hash2 ? '✅' : '❌');

console.log('\n4-3. 원래 값으로 복구 (101 → 100):');
testData.transactions[0].amount = 100;
const hash3 = bitcoin.hashBlock('parentHash123', testData, 5000);
console.log('Hash:', hash3);
console.log('원래 해시와 동일:', hash1 === hash3 ? '✅' : '❌');

// ============================================
// 예제 5: 체인 유효성 검증
// ============================================
console.log('\n\n✅ 예제 5: 체인 유효성 검증\n');

console.log('5-1. 현재 체인 검증:');
const isValid = bitcoin.chainIsValid(bitcoin.chain);
console.log('체인이 유효한가?', isValid ? '✅ 유효함' : '❌ 유효하지 않음');

console.log('\n5-2. 체인 조작 시뮬레이션:');
// 체인 복사
const tamperedChain = JSON.parse(JSON.stringify(bitcoin.chain));
// 블록 2의 트랜잭션 금액 변경
if (tamperedChain.length > 2 && tamperedChain[2].transactions.length > 0) {
  console.log('블록 2의 첫 번째 트랜잭션 금액을 변경...');
  const originalAmount = tamperedChain[2].transactions[0].amount;
  tamperedChain[2].transactions[0].amount = 99999;
  
  const isTamperedValid = bitcoin.chainIsValid(tamperedChain);
  console.log(`원래 금액: ${originalAmount}, 변경된 금액: 99999`);
  console.log('조작된 체인이 유효한가?', isTamperedValid ? '✅ 유효함' : '❌ 유효하지 않음');
}

// ============================================
// 예제 6: 더 많은 블록 생성
// ============================================
console.log('\n\n🔗 예제 6: 연속된 블록 생성\n');

console.log('6-1. 5개의 블록을 더 생성합니다...');
for (let i = 0; i < 5; i++) {
  // 트랜잭션 추가
  const amount = Math.floor(Math.random() * 100) + 1;
  const tx = bitcoin.createNewTransaction(
    amount,
    `Sender_${i}`,
    `Recipient_${i}`
  );
  bitcoin.addTransactionToPendingTransactions(tx);
  
  // POW 및 블록 생성
  const lastBlock = bitcoin.getLastBlock();
  const parentHash = lastBlock.hash;
  const blockData = {
    transactions: bitcoin.pendingTxs,
    index: lastBlock.index + 1
  };
  
  console.log(`\n블록 ${lastBlock.index + 1} 채굴 중...`);
  const nonce = bitcoin.proofOfWork(parentHash, blockData);
  const hash = bitcoin.hashBlock(parentHash, blockData, nonce);
  bitcoin.createNewBlock(parentHash, hash, nonce);
  console.log(`✅ 블록 ${lastBlock.index + 1} 생성 완료 (nonce: ${nonce.toLocaleString()})`);
}

console.log('\n6-2. 최종 블록체인 상태:');
console.log('총 블록 수:', bitcoin.chain.length);
console.log('대기 중인 트랜잭션:', bitcoin.pendingTxs.length);

// ============================================
// 예제 7: 주소 데이터 조회
// ============================================
console.log('\n\n👤 예제 7: 주소 데이터 조회\n');

// 더미 주소로 트랜잭션 생성
const aliceAddr = 'ALICE_WALLET_ADDRESS_123';
const bobAddr = 'BOB_WALLET_ADDRESS_456';

// Alice가 여러 트랜잭션 수행
const txA1 = bitcoin.createNewTransaction(50, aliceAddr, bobAddr);
const txA2 = bitcoin.createNewTransaction(30, bobAddr, aliceAddr);
const txA3 = bitcoin.createNewTransaction(20, aliceAddr, bobAddr);

bitcoin.addTransactionToPendingTransactions(txA1);
bitcoin.addTransactionToPendingTransactions(txA2);
bitcoin.addTransactionToPendingTransactions(txA3);

// 블록 생성
const lb = bitcoin.getLastBlock();
const ph = lb.hash;
const bd = {
  transactions: bitcoin.pendingTxs,
  index: lb.index + 1
};
const n = bitcoin.proofOfWork(ph, bd);
const h = bitcoin.hashBlock(ph, bd, n);
bitcoin.createNewBlock(ph, h, n);

console.log('7-1. Alice의 주소 데이터:');
const aliceData = bitcoin.getAddressData(aliceAddr);
console.log('주소:', aliceAddr);
console.log('트랜잭션 수:', aliceData.addressTransactions.length);
console.log('잔액:', aliceData.addressBalance);
console.log('트랜잭션 상세:');
aliceData.addressTransactions.forEach((tx, idx) => {
  console.log(`  ${idx + 1}. ${tx.amount} BTC - ${tx.sender === aliceAddr ? '보냄' : '받음'}`);
});

// ============================================
// 최종 요약
// ============================================
console.log('\n\n📊 최종 블록체인 요약\n');
console.log('='.repeat(50));
console.log('총 블록 수:', bitcoin.chain.length);

let totalTx = 0;
bitcoin.chain.forEach(block => {
  totalTx += block.transactions.length;
});
console.log('총 트랜잭션:', totalTx);
console.log('대기 중인 트랜잭션:', bitcoin.pendingTxs.length);
console.log('체인 유효성:', bitcoin.chainIsValid(bitcoin.chain) ? '✅ 유효' : '❌ 무효');

console.log('\n블록 목록:');
bitcoin.chain.forEach(block => {
  console.log(`  Block #${block.index}: ${block.transactions.length}개 트랜잭션, Nonce: ${block.nonce.toLocaleString()}`);
});

console.log('\n==============================================');
console.log('  모든 예제가 완료되었습니다! 🎉');
console.log('==============================================\n');
