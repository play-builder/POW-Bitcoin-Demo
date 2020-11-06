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
