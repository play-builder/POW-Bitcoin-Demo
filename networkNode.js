const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');
const rp = require('request-promise');

const app = express();
const bitcoin = new Blockchain();

// 현재 노드의 고유 주소 생성 (마이닝 보상을 받을 주소)
const nodeAddress = uuidv4().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 정적 파일 제공 (Explorer UI)
app.use(express.static('public'));

/**
 * GET /blockchain
 * 전체 블록체인 조회
 */
app.get('/blockchain', (req, res) => {
  res.send(bitcoin);
});

/**
 * POST /transaction
 * 새로운 트랜잭션 생성 및 브로드캐스트
 */
app.post('/transaction', (req, res) => {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
