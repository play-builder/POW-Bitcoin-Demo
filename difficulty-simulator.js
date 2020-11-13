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

    console.log('📊 난이도별 채굴 시간 측정\n');
    console.log('난이도는 해시의 시작 부분에 필요한 연속된 0의 개수입니다.');
    console.log('예: 난이도 3 = "000..." 으로 시작하는 해시\n');

    for (let difficulty = 1; difficulty <= maxDifficulty; difficulty++) {
      console.log(`\n🎯 난이도 ${difficulty} (해시가 "${'0'.repeat(difficulty)}" 로 시작)`);
      console.log('─'.repeat(60));
      
      const result = this.mineWithDifficulty(difficulty, data);
      this.results.push(result);

      console.log(`✅ 성공!`);
      console.log(`   Nonce: ${result.nonce.toLocaleString()}`);
      console.log(`   Hash: ${result.hash}`);
      console.log(`   시도 횟수: ${result.attempts.toLocaleString()}`);
      console.log(`   소요 시간: ${result.timeSec}초 (${result.timeMs}ms)`);
      
      if (difficulty > 1 && this.results.length > 1) {
        const prevResult = this.results[this.results.length - 2];
        const increaseRatio = (result.attempts / prevResult.attempts).toFixed(2);
        console.log(`   이전 난이도 대비: ${increaseRatio}배 더 많은 시도`);
      }
    }

    this.displaySummary();
  }

  /**
   * 시뮬레이션 결과 요약
   */
  displaySummary() {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║              시뮬레이션 결과 요약                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('난이도   평균 시도 횟수      소요 시간         해시 예시');
    console.log('─'.repeat(80));

    this.results.forEach(result => {
      const difficultyStr = result.difficulty.toString().padEnd(8);
      const attemptsStr = result.attempts.toLocaleString().padEnd(20);
      const timeStr = (result.timeSec + 's').padEnd(17);
      const hashPreview = result.hash.substring(0, 20) + '...';
      
      console.log(`${difficultyStr} ${attemptsStr} ${timeStr} ${hashPreview}`);
    });

    console.log('\n💡 핵심 인사이트:');
    console.log('─'.repeat(80));
    
    if (this.results.length >= 2) {
      const avgIncrease = this.results.reduce((sum, result, idx) => {
        if (idx === 0) return 0;
        return sum + (result.attempts / this.results[idx - 1].attempts);
      }, 0) / (this.results.length - 1);
      
      console.log(`• 난이도가 1 증가할 때마다 평균 ${avgIncrease.toFixed(2)}배의 시도가 필요합니다.`);
      console.log(`• 이는 대략 ${Math.pow(16, 1).toFixed(0)}배 (16진수 기준)에 가깝습니다.`);
    }

    const totalAttempts = this.results.reduce((sum, r) => sum + r.attempts, 0);
    const totalTime = this.results.reduce((sum, r) => sum + r.timeMs, 0);
    
