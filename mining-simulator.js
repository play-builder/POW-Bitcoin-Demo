// mining-simulator.js - 마이닝 시뮬레이터
// 실시간으로 채굴 과정을 시뮬레이션하고 통계를 표시

const Blockchain = require('./blockchain');

class MiningSimulator {
  constructor() {
    this.blockchain = new Blockchain();
    this.minerStats = new Map();
    this.isRunning = false;
  }

  /**
   * 채굴자 통계 초기화
   */
  initMiner(minerName) {
    if (!this.minerStats.has(minerName)) {
      this.minerStats.set(minerName, {
        blocksMinedBlocks: 0,
        totalRewards: 0,
        totalAttempts: 0,
        totalTime: 0,
        successRate: 0
      });
    }
  }

  /**
   * 단일 블록 채굴
   */
  mineBlock(minerName, reward = 12.5) {
    this.initMiner(minerName);
    
    const startTime = Date.now();
    
    // 트랜잭션 생성 (채굴 보상)
    const rewardTx = this.blockchain.createNewTransaction(reward, '00', minerName);
    this.blockchain.addTransactionToPendingTransactions(rewardTx);

    // POW 수행
    const lastBlock = this.blockchain.getLastBlock();
    const parentHash = lastBlock.hash;
    const blockData = {
      transactions: this.blockchain.pendingTxs,
      index: lastBlock.index + 1
    };

    const nonce = this.blockchain.proofOfWork(parentHash, blockData);
    const hash = this.blockchain.hashBlock(parentHash, blockData, nonce);
    const newBlock = this.blockchain.createNewBlock(parentHash, hash, nonce);

    const endTime = Date.now();
    const miningTime = endTime - startTime;

    // 통계 업데이트
    const stats = this.minerStats.get(minerName);
    stats.blocksMinedBlocks++;
    stats.totalRewards += reward;
    stats.totalAttempts += (nonce + 1);
    stats.totalTime += miningTime;
    stats.successRate = (stats.blocksMinedBlocks / stats.totalAttempts * 100).toFixed(6);

    return {
      block: newBlock,
      nonce,
      attempts: nonce + 1,
      timeMs: miningTime,
      miner: minerName,
      reward
    };
  }

  /**
   * 실시간 채굴 대시보드 표시
   */
  displayDashboard(result) {
    console.clear();
    
    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ⛏️  BITCOIN MINING SIMULATOR  ⛏️                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    // 최신 블록 정보
    console.log('📦 최신 채굴 블록:');
    console.log('─'.repeat(75));
    console.log(`블록 번호:    #${result.block.index}`);
    console.log(`채굴자:       ${result.miner}`);
    console.log(`해시:         ${result.block.hash}`);
    console.log(`Nonce:        ${result.nonce.toLocaleString()}`);
    console.log(`시도 횟수:    ${result.attempts.toLocaleString()}`);
    console.log(`채굴 시간:    ${(result.timeMs / 1000).toFixed(2)}초`);
    console.log(`보상:         ${result.reward} BTC`);
    console.log('');

    // 블록체인 통계
    console.log('📊 블록체인 통계:');
    console.log('─'.repeat(75));
    
    let totalTx = 0;
    this.blockchain.chain.forEach(block => {
      totalTx += block.transactions.length;
    });

    console.log(`총 블록 수:        ${this.blockchain.chain.length}`);
    console.log(`총 트랜잭션:       ${totalTx}`);
    console.log(`대기 트랜잭션:     ${this.blockchain.pendingTxs.length}`);
    console.log(`체인 유효성:       ${this.blockchain.chainIsValid(this.blockchain.chain) ? '✅' : '❌'}`);
    console.log('');

    // 채굴자 통계
    console.log('👤 채굴자 통계:');
    console.log('─'.repeat(75));
    
    const sortedMiners = Array.from(this.minerStats.entries())
      .sort((a, b) => b[1].blocksMinedBlocks - a[1].blocksMinedBlocks);

    console.log('채굴자           블록    보상(BTC)   평균시도       총시간');
    console.log('─'.repeat(75));
    
    sortedMiners.forEach(([name, stats]) => {
      const avgAttempts = stats.totalAttempts / stats.blocksMinedBlocks;
      console.log(
        `${name.padEnd(15)} ` +
        `${stats.blocksMinedBlocks.toString().padEnd(7)} ` +
        `${stats.totalRewards.toFixed(2).padEnd(11)} ` +
        `${avgAttempts.toLocaleString().padEnd(14)} ` +
        `${(stats.totalTime / 1000).toFixed(1)}s`
      );
    });

    console.log('\n');

    // 최근 블록 체인
    console.log('🔗 최근 블록 체인:');
    console.log('─'.repeat(75));
    
    const recentBlocks = this.blockchain.chain.slice(-5);
    const chainView = recentBlocks.map(block => {
      const hashPreview = block.hash.substring(0, 8);
      return `[#${block.index}:${hashPreview}]`;
    }).join(' → ');
    
    console.log(chainView);
    console.log('\n');
  }

  /**
   * 연속 채굴 시뮬레이션
   */
  async continuousMining(miners = ['Miner1', 'Miner2'], duration = 30000) {
    console.log('\n연속 채굴 시작...');
    console.log(`채굴자: ${miners.join(', ')}`);
    console.log(`실행 시간: ${duration / 1000}초\n`);
    
    this.isRunning = true;
    const startTime = Date.now();

    while (this.isRunning && (Date.now() - startTime) < duration) {
      // 랜덤하게 채굴자 선택
      const miner = miners[Math.floor(Math.random() * miners.length)];
      
      // 랜덤 트랜잭션 추가 (채굴 보상 외)
      if (Math.random() > 0.5) {
        const randomTx = this.blockchain.createNewTransaction(
          Math.floor(Math.random() * 50) + 1,
          `User${Math.floor(Math.random() * 100)}`,
          `User${Math.floor(Math.random() * 100)}`
        );
        this.blockchain.addTransactionToPendingTransactions(randomTx);
      }

      // 블록 채굴
      const result = this.mineBlock(miner);
      
      // 대시보드 업데이트
      this.displayDashboard(result);
      
      // 짧은 대기
      await this.sleep(100);
    }

    this.isRunning = false;
    this.displayFinalStats();
  }

  /**
   * 경쟁 채굴 시뮬레이션
   */
  async competitiveMining(numMiners = 3, numBlocks = 10) {
    console.log('\n⚔️  경쟁 채굴 시뮬레이션\n');
    console.log(`채굴자 수: ${numMiners}`);
    console.log(`목표 블록: ${numBlocks}\n`);

    const miners = Array.from({ length: numMiners }, (_, i) => `Miner${i + 1}`);
    
    for (let i = 0; i < numBlocks; i++) {
