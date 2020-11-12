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
    
