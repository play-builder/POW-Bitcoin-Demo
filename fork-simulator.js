// fork-simulator.js - 블록체인 분기(Fork) 시뮬레이션
// 두 노드가 동시에 블록을 채굴할 때 발생하는 분기와 해결 과정 시연

const Blockchain = require('./blockchain');

class ForkSimulator {
  constructor() {
    this.nodeA = new Blockchain();
    this.nodeB = new Blockchain();
    this.nodeC = new Blockchain();
  }

  /**
   * 노드의 체인 상태를 시각적으로 표시
   */
  visualizeChain(node, nodeName) {
    console.log(`\n${nodeName}의 체인:`);
    console.log('─'.repeat(80));
    
    const chain = node.chain.map((block, idx) => {
      const hashPreview = block.hash.substring(0, 10);
      const txCount = block.transactions.length;
      return `[${idx}:${hashPreview}(${txCount}tx)]`;
    }).join(' → ');
    
    console.log(chain);
    console.log(`체인 길이: ${node.chain.length}, 유효성: ${node.chainIsValid(node.chain) ? '✅' : '❌'}`);
  }

  /**
   * 모든 노드의 체인 비교
   */
  compareChains() {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║              노드 체인 비교                            ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    this.visualizeChain(this.nodeA, '노드 A');
    this.visualizeChain(this.nodeB, '노드 B');
    this.visualizeChain(this.nodeC, '노드 C');
    
    // 체인 길이 비교
    const lengthA = this.nodeA.chain.length;
    const lengthB = this.nodeB.chain.length;
    const lengthC = this.nodeC.chain.length;
    
    console.log('\n📊 체인 길이 비교:');
    console.log(`노드 A: ${lengthA} 블록`);
    console.log(`노드 B: ${lengthB} 블록`);
    console.log(`노드 C: ${lengthC} 블록`);
    
    // 동일성 확인
    const chainAStr = JSON.stringify(this.nodeA.chain);
    const chainBStr = JSON.stringify(this.nodeB.chain);
    const chainCStr = JSON.stringify(this.nodeC.chain);
    
    console.log('\n🔍 체인 동일성:');
    console.log(`A === B: ${chainAStr === chainBStr ? '✅' : '❌'}`);
    console.log(`B === C: ${chainBStr === chainCStr ? '✅' : '❌'}`);
    console.log(`A === C: ${chainAStr === chainCStr ? '✅' : '❌'}`);
  }

  /**
   * 시나리오 1: 정상적인 블록 전파
   */
  scenario1_NormalPropagation() {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   시나리오 1: 정상적인 블록 전파                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('초기 상태: 모든 노드가 Genesis Block만 가지고 있음');
    this.compareChains();

    console.log('\n\n단계 1: 노드 A에서 블록 1 채굴');
    console.log('─'.repeat(80));
    
    // 노드 A에서 블록 채굴
    const tx1 = this.nodeA.createNewTransaction(100, 'Alice', 'Bob');
    this.nodeA.addTransactionToPendingTransactions(tx1);
    
    const lastBlock = this.nodeA.getLastBlock();
    const parentHash = lastBlock.hash;
    const blockData = {
      transactions: this.nodeA.pendingTxs,
      index: lastBlock.index + 1
    };
    
    const nonce = this.nodeA.proofOfWork(parentHash, blockData);
    const hash = this.nodeA.hashBlock(parentHash, blockData, nonce);
    const newBlock = this.nodeA.createNewBlock(parentHash, hash, nonce);
    
    console.log(`✅ 노드 A가 블록 ${newBlock.index} 채굴 완료 (nonce: ${nonce})`);
    
    console.log('\n단계 2: 블록을 노드 B, C에 전파');
    console.log('─'.repeat(80));
    
    // 블록 전파 (실제로는 네트워크를 통해 전달됨)
    this.nodeB.chain.push(newBlock);
    this.nodeC.chain.push(newBlock);
    
    console.log('✅ 모든 노드가 블록을 수신하고 체인에 추가');
    
    this.compareChains();
    
    console.log('\n💡 결과: 모든 노드의 체인이 동일합니다.');
  }

  /**
   * 시나리오 2: Fork 발생 (동시 채굴)
   */
  scenario2_ForkOccurs() {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   시나리오 2: Fork 발생 (두 노드가 동시에 채굴)        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 초기화
    this.nodeA = new Blockchain();
    this.nodeB = new Blockchain();
    this.nodeC = new Blockchain();

    console.log('상황: 네트워크 지연으로 인해 노드 A와 B가 동시에 블록을 채굴');
    console.log('─'.repeat(80));

    // 공통 블록 1 생성
    console.log('\n먼저 모든 노드가 블록 1을 공유');
    const tx0 = this.nodeA.createNewTransaction(50, 'Initial', 'Setup');
    this.nodeA.addTransactionToPendingTransactions(tx0);
    
    let lastBlock = this.nodeA.getLastBlock();
    let parentHash = lastBlock.hash;
    let blockData = {
      transactions: this.nodeA.pendingTxs,
      index: lastBlock.index + 1
    };
    
    let nonce = this.nodeA.proofOfWork(parentHash, blockData);
    let hash = this.nodeA.hashBlock(parentHash, blockData, nonce);
    const commonBlock = this.nodeA.createNewBlock(parentHash, hash, nonce);
    
    // 모든 노드에 전파
    this.nodeB.chain.push(commonBlock);
