const sha256 = require('sha256');
const { v4: uuidv4 } = require('uuid');

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTxs = [];
    this.currentNodeUrl = process.argv[3];
    this.networkNodes = [];

    // Genesis Block 생성
