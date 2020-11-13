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
    this.nodeC.chain.push(commonBlock);
    
    this.compareChains();

    console.log('\n\n⚡ Fork 발생!');
    console.log('─'.repeat(80));
    console.log('노드 A와 노드 B가 거의 동시에 서로 다른 블록을 채굴합니다.\n');

    // 노드 A에서 블록 2A 채굴
    console.log('🔷 노드 A: 블록 2A 채굴 중...');
    const txA = this.nodeA.createNewTransaction(100, 'Alice', 'Bob');
    this.nodeA.addTransactionToPendingTransactions(txA);
    
    lastBlock = this.nodeA.getLastBlock();
    parentHash = lastBlock.hash;
    blockData = {
      transactions: this.nodeA.pendingTxs,
      index: lastBlock.index + 1
    };
    
    nonce = this.nodeA.proofOfWork(parentHash, blockData);
    hash = this.nodeA.hashBlock(parentHash, blockData, nonce);
    const block2A = this.nodeA.createNewBlock(parentHash, hash, nonce);
    
    console.log(`✅ 노드 A가 블록 2A 채굴 완료 (hash: ${block2A.hash.substring(0, 12)}...)`);

    // 노드 B에서 블록 2B 채굴 (다른 트랜잭션)
    console.log('\n🔶 노드 B: 블록 2B 채굴 중...');
    const txB = this.nodeB.createNewTransaction(200, 'Charlie', 'Dave');
    this.nodeB.addTransactionToPendingTransactions(txB);
    
    lastBlock = this.nodeB.getLastBlock();
    parentHash = lastBlock.hash;
    blockData = {
      transactions: this.nodeB.pendingTxs,
      index: lastBlock.index + 1
    };
    
    nonce = this.nodeB.proofOfWork(parentHash, blockData);
    hash = this.nodeB.hashBlock(parentHash, blockData, nonce);
    const block2B = this.nodeB.createNewBlock(parentHash, hash, nonce);
    
    console.log(`✅ 노드 B가 블록 2B 채굴 완료 (hash: ${block2B.hash.substring(0, 12)}...)`);

    // 노드 C는 먼저 받은 블록 2A를 채택
    console.log('\n🔹 노드 C: 노드 A로부터 블록 2A를 먼저 수신');
    this.nodeC.chain.push(block2A);

    console.log('\n⚠️  Fork 상태:');
    this.compareChains();

    console.log('\n📌 현재 상황:');
    console.log('• 노드 A: Genesis → Block 1 → Block 2A');
    console.log('• 노드 B: Genesis → Block 1 → Block 2B');
    console.log('• 노드 C: Genesis → Block 1 → Block 2A');
    console.log('\n⚠️  블록체인이 두 갈래로 분기되었습니다!');

    return { block2A, block2B };
  }

  /**
   * 시나리오 3: Fork 해결 (더 긴 체인 승리)
   */
  scenario3_ForkResolution(block2A, block2B) {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   시나리오 3: Fork 해결 (Longest Chain Rule)          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('상황: 노드 A가 블록 3A를 먼저 채굴하여 더 긴 체인을 만듦');
    console.log('─'.repeat(80));

    // 노드 A에서 블록 3A 채굴
    console.log('\n🔷 노드 A: 블록 3A 채굴 중...');
    const txA3 = this.nodeA.createNewTransaction(150, 'Eve', 'Frank');
    this.nodeA.addTransactionToPendingTransactions(txA3);
    
    let lastBlock = this.nodeA.getLastBlock();
    let parentHash = lastBlock.hash;
    let blockData = {
      transactions: this.nodeA.pendingTxs,
      index: lastBlock.index + 1
    };
    
    let nonce = this.nodeA.proofOfWork(parentHash, blockData);
    let hash = this.nodeA.hashBlock(parentHash, blockData, nonce);
    const block3A = this.nodeA.createNewBlock(parentHash, hash, nonce);
    
    console.log(`✅ 노드 A가 블록 3A 채굴 완료`);
    console.log(`   체인 길이: ${this.nodeA.chain.length}`);

    console.log('\n단계: 합의 알고리즘 실행');
    console.log('─'.repeat(80));
    console.log('모든 노드가 네트워크의 체인들을 비교합니다.\n');

    // 노드 B의 체인과 노드 A의 체인 비교
    console.log('🔶 노드 B:');
    console.log(`   현재 체인 길이: ${this.nodeB.chain.length}`);
    console.log(`   노드 A의 체인 길이: ${this.nodeA.chain.length}`);
    console.log(`   노드 A의 체인이 더 길고 유효함 → 체인 교체!`);
    
    // 체인 교체
    this.nodeB.chain = JSON.parse(JSON.stringify(this.nodeA.chain));
    console.log(`   ✅ 노드 B가 체인을 교체했습니다.`);

    console.log('\n🔹 노드 C:');
    console.log(`   현재 체인 길이: ${this.nodeC.chain.length}`);
    console.log(`   노드 A의 체인 길이: ${this.nodeA.chain.length}`);
    console.log(`   노드 A의 체인이 더 길고 유효함 → 체인 교체!`);
    
    this.nodeC.chain = JSON.parse(JSON.stringify(this.nodeA.chain));
    console.log(`   ✅ 노드 C가 체인을 교체했습니다.`);

    console.log('\n✅ Fork 해결 완료!');
    this.compareChains();

    console.log('\n📌 최종 상태:');
    console.log('• 모든 노드: Genesis → Block 1 → Block 2A → Block 3A');
    console.log('\n💡 핵심 원리:');
    console.log('─'.repeat(80));
    console.log('• 가장 긴 유효한 체인이 정당한 체인으로 인정됩니다.');
    console.log('• Block 2B는 버려졌습니다 (Orphan Block).');
    console.log('• Block 2B의 트랜잭션은 다시 mempool로 돌아갑니다.');
    console.log('• 이것이 비트코인의 "Longest Chain Rule"입니다.');
  }

  /**
   * 시나리오 4: 51% 공격 시뮬레이션
   */
  scenario4_51PercentAttack() {
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║   시나리오 4: 51% 공격 개념 설명                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('51% 공격이란?');
    console.log('─'.repeat(80));
    console.log('공격자가 네트워크 전체 해시파워의 51% 이상을 장악하여');
    console.log('악의적인 체인을 만들고, 정직한 체인보다 빠르게 성장시켜');
    console.log('네트워크가 악의적인 체인을 채택하도록 만드는 공격입니다.\n');

    // 초기화
    this.nodeA = new Blockchain(); // 정직한 네트워크
    this.nodeB = new Blockchain(); // 공격자
