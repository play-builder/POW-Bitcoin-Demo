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
  
  // 블록 검증
  const correctHash = lastBlock.hash === newBlock.parentHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTxs = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock: newBlock
    });
  } else {
    res.json({
      note: 'New block rejected.',
      newBlock: newBlock
    });
  }
});

/**
 * POST /register-and-broadcast-node
 * 새로운 노드를 등록하고 네트워크에 브로드캐스트
 */
app.post('/register-and-broadcast-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  
  // 네트워크 노드 목록에 추가 (중복 방지)
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
    bitcoin.networkNodes.push(newNodeUrl);
  }

  // 기존 네트워크의 모든 노드에 새 노드 등록 요청
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl: newNodeUrl },
      json: true
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then(data => {
      // 새 노드에 기존 네트워크의 모든 노드 정보 전송
      const bulkRegisterOptions = {
        uri: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
        json: true
      };

      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({ note: 'New node registered with network successfully.' });
    });
});

/**
 * POST /register-node
 * 개별 노드 등록
 */
app.post('/register-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  
  if (nodeNotAlreadyPresent && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  
  res.json({ note: 'New node registered successfully.' });
});

/**
 * POST /register-nodes-bulk
 * 여러 노드를 한 번에 등록
 */
app.post('/register-nodes-bulk', (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    
    if (nodeNotAlreadyPresent && notCurrentNode) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ note: 'Bulk registration successful.' });
});

/**
 * GET /consensus
 * 합의 알고리즘 - 가장 긴 체인을 선택
 */
app.get('/consensus', (req, res) => {
  const requestPromises = [];
  
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/blockchain',
      method: 'GET',
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(blockchains => {
      const currentChainLength = bitcoin.chain.length;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;

      // 가장 긴 체인 찾기
      blockchains.forEach(blockchain => {
        if (blockchain.chain.length > maxChainLength) {
          maxChainLength = blockchain.chain.length;
          newLongestChain = blockchain.chain;
          newPendingTransactions = blockchain.pendingTxs;
        }
      });

      // 더 긴 체인이 없거나 유효하지 않은 경우
      if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
        res.json({
          note: 'Current chain has not been replaced.',
          chain: bitcoin.chain
        });
      }
      // 유효한 더 긴 체인으로 교체
      else {
        bitcoin.chain = newLongestChain;
        bitcoin.pendingTxs = newPendingTransactions;
        res.json({
          note: 'This chain has been replaced.',
          chain: bitcoin.chain
        });
      }
    });
});

/**
 * GET /block/:blockHash
 * 특정 블록 조회
 */
app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock
  });
});

/**
 * GET /transaction/:transactionId
 * 특정 트랜잭션 조회
 */
app.get('/transaction/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  const transactionData = bitcoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block
  });
});

/**
 * GET /address/:address
 * 특정 주소의 트랜잭션 및 잔액 조회
 */
app.get('/address/:address', (req, res) => {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);
  res.json({
    addressData: addressData
  });
});

/**
 * GET /block-explorer
 * 블록 탐색기 UI 제공
 */
app.get('/block-explorer', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

// 서버 시작
const port = process.argv[2];
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
