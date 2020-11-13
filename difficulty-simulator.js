// difficulty-simulator.js - POW 난이도 시뮬레이션
// 다양한 난이도(0의 개수)에 따른 채굴 시간 측정

const sha256 = require('sha256');

class DifficultySimulator {
  constructor() {
    this.results = [];
  }

  /**
   * 특정 난이도로 POW 수행
   * @param {number} difficulty - 해시 시작 부분에 필요한 0의 개수
   * @param {object} data - 해싱할 데이터
   * @returns {object} 결과 (nonce, hash, attempts, time)
   */
  mineWithDifficulty(difficulty, data) {
    const target = '0'.repeat(difficulty);
    let nonce = 0;
    let hash;
    let attempts = 0;
    
    const startTime = Date.now();
    
    do {
      const input = JSON.stringify(data) + nonce.toString();
      hash = sha256(input);
      attempts++;
      nonce++;
    } while (!hash.startsWith(target));
    
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    
    return {
      difficulty,
      nonce: nonce - 1,
      hash,
      attempts,
      timeMs: timeElapsed,
      timeSec: (timeElapsed / 1000).toFixed(2)
    };
  }

  /**
   * 여러 난이도로 테스트 실행
   * @param {number} maxDifficulty - 최대 난이도
   * @param {object} data - 테스트 데이터
   */
  runSimulation(maxDifficulty = 5, data = null) {
    if (!data) {
      data = {
        transactions: [
          { amount: 100, sender: 'Alice', recipient: 'Bob' }
        ],
        timestamp: Date.now()
      };
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     Bitcoin POW Difficulty Simulation                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

