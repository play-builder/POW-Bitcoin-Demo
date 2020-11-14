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
