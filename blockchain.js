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
