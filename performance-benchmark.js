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

