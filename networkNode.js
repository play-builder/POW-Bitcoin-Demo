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
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

/**
 * POST /transaction/broadcast
 * 트랜잭션 생성 후 네트워크에 브로드캐스트
 */
app.post('/transaction/broadcast', (req, res) => {
  const newTransaction = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );

  bitcoin.addTransactionToPendingTransactions(newTransaction);

  // 네트워크의 모든 노드에 트랜잭션 전파
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      res.json({ note: 'Transaction created and broadcast successfully.' });
    });
