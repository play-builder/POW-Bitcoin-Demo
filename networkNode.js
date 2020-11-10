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
});

/**
 * GET /mine
 * 새로운 블록 채굴
 */
app.get('/mine', (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  
  const currentBlockData = {
    transactions: bitcoin.pendingTxs,
    index: lastBlock['index'] + 1
  };

  // Proof of Work 수행
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

  // 채굴 보상 트랜잭션 생성
  const newBlock = bitcoin.createNewBlock(previousBlockHash, blockHash, nonce);

  // 새로 채굴된 블록을 네트워크에 브로드캐스트
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      // 채굴 보상 트랜잭션 브로드캐스트
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: 12.5,
          sender: "00", // 시스템에서 발행
          recipient: nodeAddress
        },
        json: true
      };

      return rp(requestOptions);
    })
    .then(data => {
      res.json({
        note: "New block mined & broadcast successfully",
        block: newBlock
      });
    });
});

/**
 * POST /receive-new-block
 * 다른 노드로부터 새로운 블록 수신
 */
app.post('/receive-new-block', (req, res) => {
  const newBlock = req.body.newBlock;
  const lastBlock = bitcoin.getLastBlock();
