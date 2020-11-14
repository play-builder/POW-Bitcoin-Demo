// performance-benchmark.js - POW 성능 벤치마크
// 다양한 조건에서 블록체인 성능 측정

const Blockchain = require('./blockchain');
const os = require('os');

class PerformanceBenchmark {
  constructor() {
    this.results = {
      system: this.getSystemInfo(),
      tests: []
    };
  }

  /**
   * 시스템 정보 수집
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus()[0].model,
      cores: os.cpus().length,
      totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
      freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
      nodeVersion: process.version
    };
  }

  /**
   * 시스템 정보 출력
   */
  displaySystemInfo() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           시스템 정보                                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    const info = this.results.system;
    console.log(`플랫폼: ${info.platform} (${info.arch})`);
    console.log(`CPU: ${info.cpus}`);
    console.log(`코어 수: ${info.cores}`);
    console.log(`총 메모리: ${info.totalMemory}`);
    console.log(`여유 메모리: ${info.freeMemory}`);
    console.log(`Node.js 버전: ${info.nodeVersion}`);
  }

  /**
   * 테스트 1: 블록 생성 속도
   */
  testBlockCreation(numBlocks = 10) {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   테스트 1: 블록 생성 속도                             ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const blockchain = new Blockchain();
    const startTime = Date.now();
    const results = [];

    console.log(`${numBlocks}개의 블록을 생성합니다...\n`);

    for (let i = 0; i < numBlocks; i++) {
      const blockStartTime = Date.now();
      
      // 트랜잭션 추가
      const tx = blockchain.createNewTransaction(
        Math.floor(Math.random() * 100),
        `Sender${i}`,
        `Recipient${i}`
      );
      blockchain.addTransactionToPendingTransactions(tx);

      // POW 수행
      const lastBlock = blockchain.getLastBlock();
      const parentHash = lastBlock.hash;
      const blockData = {
        transactions: blockchain.pendingTxs,
        index: lastBlock.index + 1
      };

      const nonce = blockchain.proofOfWork(parentHash, blockData);
      const hash = blockchain.hashBlock(parentHash, blockData, nonce);
      blockchain.createNewBlock(parentHash, hash, nonce);

      const blockEndTime = Date.now();
      const blockTime = blockEndTime - blockStartTime;

      results.push({
        blockIndex: i + 1,
        nonce: nonce,
        attempts: nonce + 1,
        timeMs: blockTime
      });

      console.log(`블록 ${i + 1}: ${blockTime}ms (nonce: ${nonce.toLocaleString()})`);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 통계 계산
    const avgTime = results.reduce((sum, r) => sum + r.timeMs, 0) / results.length;
    const minTime = Math.min(...results.map(r => r.timeMs));
    const maxTime = Math.max(...results.map(r => r.timeMs));
    const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);
    const avgAttempts = totalAttempts / results.length;

    console.log('\n📊 통계:');
    console.log('─'.repeat(60));
    console.log(`총 소요 시간: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}초)`);
    console.log(`블록당 평균 시간: ${avgTime.toFixed(2)}ms`);
    console.log(`최소 시간: ${minTime}ms`);
    console.log(`최대 시간: ${maxTime}ms`);
    console.log(`총 해시 시도: ${totalAttempts.toLocaleString()}`);
    console.log(`블록당 평균 시도: ${avgAttempts.toLocaleString()}`);
    console.log(`초당 해시 속도: ${(totalAttempts / (totalTime / 1000)).toFixed(0)} H/s`);

    this.results.tests.push({
      name: 'Block Creation Speed',
      numBlocks,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      totalAttempts,
      hashrate: (totalAttempts / (totalTime / 1000)).toFixed(0)
    });
  }

  /**
   * 테스트 2: 트랜잭션 처리 속도
   */
  testTransactionThroughput(numTransactions = 1000) {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   테스트 2: 트랜잭션 처리 속도                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const blockchain = new Blockchain();
    
    console.log(`${numTransactions}개의 트랜잭션을 생성합니다...\n`);
    
    const startTime = Date.now();

    for (let i = 0; i < numTransactions; i++) {
      const tx = blockchain.createNewTransaction(
        Math.floor(Math.random() * 1000),
        `Sender${i}`,
        `Recipient${i}`
      );
      blockchain.addTransactionToPendingTransactions(tx);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const tps = numTransactions / (totalTime / 1000);

    console.log('✅ 트랜잭션 생성 완료\n');
    console.log('📊 통계:');
    console.log('─'.repeat(60));
    console.log(`총 트랜잭션: ${numTransactions.toLocaleString()}`);
    console.log(`소요 시간: ${totalTime}ms`);
    console.log(`TPS (초당 트랜잭션): ${tps.toFixed(0)}`);
    console.log(`트랜잭션당 평균 시간: ${(totalTime / numTransactions).toFixed(3)}ms`);

    this.results.tests.push({
      name: 'Transaction Throughput',
      numTransactions,
      totalTime,
      tps: tps.toFixed(0)
    });
  }

  /**
   * 테스트 3: 체인 유효성 검증 속도
   */
  testChainValidation(chainLength = 50) {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   테스트 3: 체인 유효성 검증 속도                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`${chainLength}개의 블록으로 체인 생성 중...\n`);

    const blockchain = new Blockchain();

    // 체인 생성
    for (let i = 0; i < chainLength - 1; i++) {
      const tx = blockchain.createNewTransaction(100, `S${i}`, `R${i}`);
      blockchain.addTransactionToPendingTransactions(tx);

      const lastBlock = blockchain.getLastBlock();
      const parentHash = lastBlock.hash;
      const blockData = {
        transactions: blockchain.pendingTxs,
        index: lastBlock.index + 1
      };

      const nonce = blockchain.proofOfWork(parentHash, blockData);
      const hash = blockchain.hashBlock(parentHash, blockData, nonce);
      blockchain.createNewBlock(parentHash, hash, nonce);

      if ((i + 1) % 10 === 0) {
        console.log(`${i + 1}개 블록 생성 완료...`);
      }
    }

    console.log(`\n✅ ${chainLength}개 블록 체인 생성 완료`);
    console.log('\n체인 유효성 검증 중...');

    // 유효성 검증
    const startTime = Date.now();
    const isValid = blockchain.chainIsValid(blockchain.chain);
    const endTime = Date.now();
    const validationTime = endTime - startTime;

    console.log(`\n✅ 검증 완료: ${isValid ? '유효함' : '유효하지 않음'}\n`);
    console.log('📊 통계:');
    console.log('─'.repeat(60));
    console.log(`체인 길이: ${chainLength} 블록`);
    console.log(`검증 시간: ${validationTime}ms`);
    console.log(`블록당 평균 검증 시간: ${(validationTime / chainLength).toFixed(3)}ms`);

    this.results.tests.push({
      name: 'Chain Validation Speed',
      chainLength,
      validationTime,
      isValid
    });
  }

  /**
   * 테스트 4: 메모리 사용량
   */
  testMemoryUsage(numBlocks = 100) {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   테스트 4: 메모리 사용량                              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 가비지 컬렉션 강제 실행 (가능한 경우)
    if (global.gc) {
      global.gc();
    }

    const startMemory = process.memoryUsage();
    console.log('시작 메모리:');
    console.log(`  Heap Used: ${(startMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(startMemory.external / 1024 / 1024).toFixed(2)} MB\n`);

    console.log(`${numBlocks}개의 블록 생성 중...\n`);

    const blockchain = new Blockchain();

    for (let i = 0; i < numBlocks - 1; i++) {
      // 여러 트랜잭션 추가
      for (let j = 0; j < 5; j++) {
        const tx = blockchain.createNewTransaction(100, `S${i}-${j}`, `R${i}-${j}`);
        blockchain.addTransactionToPendingTransactions(tx);
      }

      const lastBlock = blockchain.getLastBlock();
      const parentHash = lastBlock.hash;
      const blockData = {
        transactions: blockchain.pendingTxs,
        index: lastBlock.index + 1
      };

      const nonce = blockchain.proofOfWork(parentHash, blockData);
      const hash = blockchain.hashBlock(parentHash, blockData, nonce);
      blockchain.createNewBlock(parentHash, hash, nonce);

      if ((i + 1) % 20 === 0) {
        const currentMemory = process.memoryUsage();
        console.log(`${i + 1}개 블록 - Heap: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      }
    }

    const endMemory = process.memoryUsage();
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;

    console.log('\n✅ 블록 생성 완료\n');
    console.log('📊 메모리 통계:');
    console.log('─'.repeat(60));
    console.log('종료 메모리:');
    console.log(`  Heap Used: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(endMemory.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n메모리 증가량: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    console.log(`블록당 평균 메모리: ${(memoryIncrease / numBlocks / 1024).toFixed(2)} KB`);
