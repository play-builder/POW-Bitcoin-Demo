// visualize-chain.js - 블록체인 시각화 도구
// 콘솔에서 블록체인을 시각적으로 아름답게 표현

const Blockchain = require('./blockchain');

class ChainVisualizer {
  constructor(blockchain) {
    this.blockchain = blockchain || new Blockchain();
  }

  /**
   * 단일 블록을 박스 형태로 시각화
   */
  visualizeBlock(block, showTransactions = true) {
    const width = 70;
    const line = '─'.repeat(width);
    const doubleLine = '═'.repeat(width);
    
    console.log('┌' + line + '┐');
    
    // 블록 헤더
    const headerText = `BLOCK #${block.index}`;
    const padding = Math.floor((width - headerText.length) / 2);
    console.log('│' + ' '.repeat(padding) + headerText + ' '.repeat(width - padding - headerText.length) + '│');
    
    console.log('├' + doubleLine + '┤');
    
    // 블록 정보
    this.printRow('Index', block.index.toString(), width);
    this.printRow('Timestamp', new Date(block.timestamp).toLocaleString('ko-KR'), width);
    this.printRow('Nonce', block.nonce.toLocaleString(), width);
    
    console.log('├' + line + '┤');
    
    this.printRow('Hash', this.truncateHash(block.hash, 50), width);
    this.printRow('Parent Hash', this.truncateHash(block.parentHash, 50), width);
    
    console.log('├' + line + '┤');
    
    // 트랜잭션
    this.printRow('Transactions', block.transactions.length.toString(), width);
    
    if (showTransactions && block.transactions.length > 0) {
      console.log('├' + line + '┤');
      block.transactions.forEach((tx, idx) => {
        if (idx < 3) { // 최대 3개만 표시
          const txSummary = `${tx.sender.substring(0, 10)}... → ${tx.recipient.substring(0, 10)}... (${tx.amount} BTC)`;
          this.printRow(`TX ${idx + 1}`, txSummary, width);
        }
      });
      if (block.transactions.length > 3) {
        this.printRow('', `... and ${block.transactions.length - 3} more`, width);
      }
    }
    
    console.log('└' + line + '┘');
  }

  /**
   * 전체 체인을 시각화
   */
  visualizeChain(maxBlocks = null) {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                     BLOCKCHAIN VISUALIZATION                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    const blocks = maxBlocks ? this.blockchain.chain.slice(0, maxBlocks) : this.blockchain.chain;
    
    blocks.forEach((block, index) => {
      this.visualizeBlock(block, true);
      
      // 연결 화살표
      if (index < blocks.length - 1) {
        console.log('        ↓ ↓ ↓ ↓ ↓ ↓ ↓');
        console.log('');
      }
    });

    if (maxBlocks && this.blockchain.chain.length > maxBlocks) {
      console.log(`\n... and ${this.blockchain.chain.length - maxBlocks} more blocks\n`);
    }

    this.displayChainStats();
  }

  /**
   * 체인 통계 표시
   */
  displayChainStats() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                        BLOCKCHAIN STATISTICS                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    const totalBlocks = this.blockchain.chain.length;
    let totalTransactions = 0;
    let totalNonce = 0;
    
    this.blockchain.chain.forEach(block => {
      totalTransactions += block.transactions.length;
      totalNonce += block.nonce;
    });

    const avgNonce = totalBlocks > 0 ? (totalNonce / totalBlocks).toFixed(0) : 0;
    const isValid = this.blockchain.chainIsValid(this.blockchain.chain);

    const stats = [
      ['Total Blocks', totalBlocks],
      ['Total Transactions', totalTransactions],
      ['Pending Transactions', this.blockchain.pendingTxs.length],
      ['Average Nonce', avgNonce],
      ['Chain Valid', isValid ? '✅ Yes' : '❌ No']
    ];

    const maxKeyLength = Math.max(...stats.map(s => s[0].length));
    
    stats.forEach(([key, value]) => {
      const padding = ' '.repeat(maxKeyLength - key.length);
      console.log(`  ${key}:${padding}  ${value}`);
    });

    console.log('\n');
  }

  /**
   * 체인을 간단한 플로우차트로 표시
   */
  visualizeFlow() {
    console.log('\n');
    console.log('BLOCKCHAIN FLOW:');
    console.log('═'.repeat(80));
    console.log('\n');

    const flow = this.blockchain.chain.map((block, idx) => {
      const hashPreview = block.hash.substring(0, 8);
      const txCount = block.transactions.length;
      return `[#${idx}:${hashPreview}(${txCount}tx)]`;
    }).join(' → ');

    // 긴 체인은 여러 줄로 분할
    const maxLineLength = 75;
    let currentLine = '';
    
    flow.split(' → ').forEach((blockStr, idx) => {
      if (currentLine.length + blockStr.length + 3 > maxLineLength) {
        console.log(currentLine);
        console.log('    ↓');
        currentLine = blockStr;
      } else {
        if (currentLine) currentLine += ' → ';
        currentLine += blockStr;
      }
    });
    
    if (currentLine) console.log(currentLine);
    
    console.log('\n');
  }

  /**
   * 블록 간 연결 그래프
   */
  visualizeConnections() {
    console.log('\n');
    console.log('BLOCK CONNECTIONS (Parent → Child):');
    console.log('═'.repeat(80));
    console.log('\n');

    this.blockchain.chain.forEach((block, idx) => {
      if (idx === 0) {
        console.log(`Block 0 (Genesis): ${this.truncateHash(block.hash, 20)}`);
      } else {
        const prevHash = this.truncateHash(block.parentHash, 20);
        const currHash = this.truncateHash(block.hash, 20);
        const valid = block.parentHash === this.blockchain.chain[idx - 1].hash ? '✅' : '❌';
        
        console.log(`Block ${idx}: ${prevHash} → ${currHash} ${valid}`);
      }
    });

    console.log('\n');
  }

  /**
   * 트랜잭션 플로우 시각화
   */
  visualizeTransactionFlow() {
    console.log('\n');
    console.log('TRANSACTION FLOW:');
    console.log('═'.repeat(80));
    console.log('\n');

    // 주소별 잔액 계산
    const balances = new Map();

    this.blockchain.chain.forEach(block => {
      block.transactions.forEach(tx => {
        // 송신자
        if (tx.sender !== '00') {
          const currentBalance = balances.get(tx.sender) || 0;
          balances.set(tx.sender, currentBalance - tx.amount);
        }
        
        // 수신자
        const recipientBalance = balances.get(tx.recipient) || 0;
        balances.set(tx.recipient, recipientBalance + tx.amount);
      });
    });

    if (balances.size === 0) {
      console.log('  No transactions yet.\n');
      return;
    }

    console.log('Address Balances:\n');
    
    // 잔액 정렬
    const sortedBalances = Array.from(balances.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // 상위 10개만

    sortedBalances.forEach(([address, balance]) => {
      const addr = address.substring(0, 20) + '...';
      const balanceStr = balance.toFixed(2);
      const bar = '█'.repeat(Math.max(1, Math.floor(Math.abs(balance) / 10)));
      const sign = balance >= 0 ? '+' : '-';
      
      console.log(`  ${addr.padEnd(25)} ${sign}${Math.abs(balance).toFixed(2)} BTC ${bar}`);
    });

    console.log('\n');
  }

  /**
   * 유틸리티: 해시 자르기
   */
  truncateHash(hash, maxLength = 30) {
    if (!hash || hash.length <= maxLength) return hash || 'N/A';
    return hash.substring(0, maxLength) + '...';
  }

  /**
   * 유틸리티: 행 출력
   */
  printRow(label, value, width) {
    const maxValueLength = width - label.length - 4;
    const truncatedValue = value.length > maxValueLength 
      ? value.substring(0, maxValueLength - 3) + '...'
      : value;
    
    const padding = width - label.length - truncatedValue.length - 2;
    console.log(`│ ${label}: ${truncatedValue}${' '.repeat(padding)}│`);
  }

  /**
   * 대화형 뷰어
   */
  interactiveView() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                   BLOCKCHAIN INTERACTIVE VIEWER                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝');
    
    this.visualizeFlow();
    this.visualizeConnections();
    this.visualizeTransactionFlow();
    this.displayChainStats();
  }

  /**
   * 애니메이션 효과로 블록 추가 시연
   */
  async animateBlockAddition() {
    console.log('\n');
    console.log('🎬 블록 추가 애니메이션\n');

    // 트랜잭션 추가
    console.log('1️⃣  트랜잭션 생성...');
    const tx = this.blockchain.createNewTransaction(100, 'Alice', 'Bob');
    this.blockchain.addTransactionToPendingTransactions(tx);
    console.log(`   ✅ 트랜잭션 생성 완료: ${tx.amount} BTC`);
    
    await this.sleep(500);

    // POW 시작
    console.log('\n2️⃣  Proof of Work 시작...');
    const lastBlock = this.blockchain.getLastBlock();
    const parentHash = lastBlock.hash;
    const blockData = {
      transactions: this.blockchain.pendingTxs,
      index: lastBlock.index + 1
    };

    let nonce = 0;
    let hash = '';
    let attempts = 0;
    
    const startTime = Date.now();
    
    // POW 진행 상황 표시
    const interval = setInterval(() => {
      attempts++;
      process.stdout.write(`\r   시도 중... ${attempts.toLocaleString()} 해시 계산됨`);
    }, 50);

    nonce = this.blockchain.proofOfWork(parentHash, blockData);
    hash = this.blockchain.hashBlock(parentHash, blockData, nonce);
    
    clearInterval(interval);
    
    const endTime = Date.now();
    console.log(`\r   ✅ Nonce 발견: ${nonce.toLocaleString()} (${(endTime - startTime)}ms)`);
    console.log(`   Hash: ${hash}`);

    await this.sleep(500);

    // 블록 생성
    console.log('\n3️⃣  블록 생성...');
    const newBlock = this.blockchain.createNewBlock(parentHash, hash, nonce);
    console.log(`   ✅ 블록 #${newBlock.index} 생성 완료`);

    await this.sleep(500);

    // 체인 표시
    console.log('\n4️⃣  업데이트된 체인:\n');
    this.visualizeFlow();
  }

  /**
   * Sleep 유틸리티
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
if (require.main === module) {
  const blockchain = new Blockchain();
  
  // 샘플 블록 생성
  console.log('샘플 블록체인 생성 중...\n');
  
  for (let i = 0; i < 5; i++) {
    const tx = blockchain.createNewTransaction(
      Math.floor(Math.random() * 100) + 10,
      `Sender${i}`,
      `Recipient${i}`
    );
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
    
    console.log(`블록 ${i + 1} 생성 완료...`);
  }

  const visualizer = new ChainVisualizer(blockchain);
  
  // 다양한 시각화 옵션
  console.log('\n\n');
  visualizer.interactiveView();
  
  console.log('\n');
  console.log('상세 블록 뷰:');
  visualizer.visualizeChain(3); // 처음 3개 블록만

  // 애니메이션 데모
  console.log('\n\n');
  visualizer.animateBlockAddition();
}

module.exports = ChainVisualizer;
