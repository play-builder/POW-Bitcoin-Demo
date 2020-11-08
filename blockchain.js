const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTxs = [];
    this.currentNodeUrl = process.argv[3];
    this.networkNodes = [];

    // Genesis Block 생성
    this.createNewBlock('0', '0', 0);
  }

  /**
   * 새로운 블록 생성
   * @param {string} parentHash - 이전 블록의 해시값
   * @param {string} hash - 현재 블록의 해시값
   * @param {number} nonce - Proof of Work를 통해 찾은 nonce 값
   * @returns {object} 새로 생성된 블록
   */
  createNewBlock(parentHash, hash, nonce) {
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      parentHash: parentHash,
      hash: hash,
      nonce: nonce,
      transactions: this.pendingTxs,
    };

    this.pendingTxs = [];
    this.chain.push(newBlock);

    return newBlock;
  }

  /**
   * 마지막 블록 조회
   * @returns {object} 체인의 마지막 블록
   */
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * 새로운 트랜잭션 생성
   * @param {number} amount - 전송할 금액
   * @param {string} sender - 송신자 주소
   * @param {string} recipient - 수신자 주소
   * @returns {number} 트랜잭션이 포함될 블록의 인덱스
   */
  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      transactionId: uuidv4().split('-').join(''),
      amount: amount,
      sender: sender,
      recipient: recipient,
      timestamp: Date.now(),
    };

    return newTransaction;
  }

  /**
   * 새로운 트랜잭션을 pending 트랜잭션에 추가
   * @param {object} transactionObj - 트랜잭션 객체
   * @returns {number} 트랜잭션이 포함될 블록 인덱스
   */
  addTransactionToPendingTransactions(transactionObj) {
    this.pendingTxs.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
  }

  /**
   * 블록 데이터를 해싱
   * @param {string} parentHash - 이전 블록의 해시
   * @param {array} currentBlockData - 현재 블록의 트랜잭션 데이터
   * @param {number} nonce - 논스 값
   * @returns {string} SHA256 해시값
   */
  hashBlock(parentHash, currentBlockData, nonce) {
    const dataAsString = parentHash + JSON.stringify(currentBlockData) + nonce.toString();
    const hash = sha256(dataAsString);
    return hash;
  }

  /**
   * Proof of Work (작업 증명)
   * 0000으로 시작하는 해시를 찾을 때까지 nonce를 증가시킴
   * @param {string} parentHash - 이전 블록의 해시
   * @param {array} currentBlockData - 현재 블록의 트랜잭션 데이터
   * @returns {number} 조건을 만족하는 nonce 값
   */
  proofOfWork(parentHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(parentHash, currentBlockData, nonce);
    
    // 0000으로 시작하는 해시를 찾을 때까지 반복
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(parentHash, currentBlockData, nonce);
    }

    return nonce;
  }

  /**
   * 체인의 유효성 검증
   * @param {array} blockchain - 검증할 블록체인
   * @returns {boolean} 유효성 여부
   */
  chainIsValid(blockchain) {
    let validChain = true;

    // 각 블록 검증 (Genesis 블록 제외)
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const prevBlock = blockchain[i - 1];

      // 현재 블록의 해시 재계산하여 검증
      const blockHash = this.hashBlock(
        prevBlock['hash'],
        {
          transactions: currentBlock['transactions'],
          index: currentBlock['index']
        },
        currentBlock['nonce']
      );

      // 해시가 0000으로 시작하지 않으면 유효하지 않음
      if (blockHash.substring(0, 4) !== '0000') {
        validChain = false;
