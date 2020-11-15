# Bitcoin POW Blockchain Demo

비트코인의 Proof of Work(작업 증명) 합의 알고리즘을 구현한 블록체인 시연 프로젝트입니다.

## 🎯 프로젝트 목표

- 블록체인의 기본 개념 이해
- Proof of Work (POW) 작동 원리 학습
- 분산 네트워크에서의 합의 알고리즘 체험
- 블록체인 탐색기(Explorer) 구현

## 📚 주요 개념

### 1. 블록체인 (Blockchain)
블록들이 체인처럼 연결된 분산 원장 시스템입니다. 각 블록은 이전 블록의 해시를 포함하여 체인을 형성합니다.

### 2. Proof of Work (작업 증명)
특정 조건(예: 0000으로 시작하는 해시)을 만족하는 nonce 값을 찾는 과정입니다. 이는 계산 비용을 요구하여 블록체인의 보안을 강화합니다.

### 3. Genesis Block (제네시스 블록)
블록체인의 첫 번째 블록으로, 이전 블록이 없는 특수한 블록입니다.

### 4. Hash (해시)
블록의 고유한 디지털 지문입니다. SHA-256 알고리즘을 사용하여 생성됩니다.

### 5. Nonce
"Number used ONCE"의 약자로, Proof of Work에서 조건을 만족하는 해시를 찾기 위해 반복적으로 변경되는 숫자입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- npm

### 설치

```bash
# 프로젝트 폴더로 이동
cd bitcoin-pow-demo

# 의존성 설치
npm install
```

### 실행

#### 1. 기본 테스트

```bash
# 기본 테스트 스크립트 실행
npm test

# 다양한 예제 실행
npm run examples
```

테스트 결과는 다음을 포함합니다:
- Genesis Block 생성 확인
- 트랜잭션 생성
- Proof of Work 수행
- 블록 생성
- 체인 유효성 검증
- 해시 함수 특성 확인

#### 2. 시뮬레이터 도구

프로젝트에는 POW와 블록체인을 깊이 이해할 수 있는 다양한 시뮬레이터가 포함되어 있습니다:

```bash
# 난이도별 채굴 시간 측정
npm run difficulty

# Fork 발생 및 해결 과정 시연
npm run fork

# 성능 벤치마크 실행
npm run benchmark

# 블록체인 시각화
npm run visualize

# 마이닝 시뮬레이션
npm run mining
```

**시뮬레이터 상세:**

- **difficulty-simulator.js**: 난이도(0의 개수)에 따른 채굴 시간 변화를 측정하고 비트코인 실제 난이도와 비교
- **fork-simulator.js**: 체인 분기(Fork) 발생, 해결 과정, 51% 공격 개념을 시뮬레이션
- **performance-benchmark.js**: 블록 생성, 트랜잭션 처리, 체인 검증, 메모리 사용량 등 성능 측정
- **visualize-chain.js**: 블록체인을 콘솔에서 시각적으로 표현
- **mining-simulator.js**: 실시간 채굴 대시보드, 경쟁 채굴, 난이도 조절 시뮬레이션

#### 3. 네트워크 노드 실행

여러 터미널에서 각각 다른 노드를 실행합니다:

```bash
# 터미널 1 - 노드 1 (포트 3001)
npm run node_1

# 터미널 2 - 노드 2 (포트 3002)
npm run node_2

# 터미널 3 - 노드 3 (포트 3003)
npm run node_3
```

#### 3. Explorer UI 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:3001/block-explorer
```

## 🔧 API 엔드포인트

### 블록체인 조회
```
GET /blockchain
```
전체 블록체인 데이터를 조회합니다.

### 트랜잭션 생성 및 브로드캐스트
```
POST /transaction/broadcast
Content-Type: application/json

{
  "amount": 100,
  "sender": "SENDER_ADDRESS",
  "recipient": "RECIPIENT_ADDRESS"
}
```

### 블록 채굴
```
GET /mine
```
새로운 블록을 채굴합니다 (Proof of Work 수행).

### 블록 조회
```
GET /block/:blockHash
```
특정 블록을 해시값으로 조회합니다.

### 트랜잭션 조회
```
GET /transaction/:transactionId
```
특정 트랜잭션을 ID로 조회합니다.

### 주소 조회
```
GET /address/:address
```
특정 주소의 모든 트랜잭션과 잔액을 조회합니다.

### 노드 등록
```
POST /register-and-broadcast-node
Content-Type: application/json

{
  "newNodeUrl": "http://localhost:3002"
}
```
새로운 노드를 네트워크에 등록합니다.

### 합의 알고리즘
```
GET /consensus
```
네트워크에서 가장 긴 유효한 체인으로 동기화합니다.

## 📝 사용 예시

### 1. Postman을 사용한 트랜잭션 생성

```bash
# 노드 1에서 트랜잭션 생성
POST http://localhost:3001/transaction/broadcast
{
  "amount": 100,
  "sender": "ALICE_ADDRESS_123",
  "recipient": "BOB_ADDRESS_456"
}
```

### 2. 블록 채굴

```bash
# 노드 2에서 블록 채굴
GET http://localhost:3002/mine
```

### 3. 노드 연결

```bash
# 노드 1에 노드 2를 등록
POST http://localhost:3001/register-and-broadcast-node
{
  "newNodeUrl": "http://localhost:3002"
}

# 노드 1에 노드 3을 등록
POST http://localhost:3001/register-and-broadcast-node
{
  "newNodeUrl": "http://localhost:3003"
}
```

### 4. 네트워크 동기화

```bash
# 노드 3에서 합의 알고리즘 실행 (가장 긴 체인으로 동기화)
GET http://localhost:3003/consensus
```

## 🎨 Explorer UI 기능

블록체인 탐색기는 다음 기능을 제공합니다:

1. **전체 블록체인 조회**: 모든 블록과 통계 정보 표시
2. **블록 검색**: 해시값으로 특정 블록 조회
3. **트랜잭션 검색**: 트랜잭션 ID로 조회
4. **주소 검색**: 지갑 주소의 잔액 및 거래 내역 조회
5. **블록 채굴**: 웹 UI에서 직접 블록 채굴 가능

## 📊 블록 구조

```javascript
{
  index: 0,                    // 블록 번호
  timestamp: 1581315769731,    // 생성 시간 (밀리초)
  parentHash: "...",           // 이전 블록의 해시
  hash: "...",                 // 현재 블록의 해시
  nonce: 100,                  // Proof of Work로 찾은 nonce
  transactions: [...]          // 포함된 트랜잭션들
}
```

## 💡 Proof of Work 동작 원리

```javascript
// 1. nonce를 0부터 시작
let nonce = 0;

// 2. 블록 데이터와 nonce로 해시 생성
let hash = hashBlock(parentHash, currentBlockData, nonce);

// 3. 해시가 '0000'으로 시작할 때까지 nonce 증가
while (hash.substring(0, 4) !== '0000') {
  nonce++;
  hash = hashBlock(parentHash, currentBlockData, nonce);
}

// 4. 조건을 만족하는 nonce 반환
return nonce;
```

### POW의 중요성

- **보안성**: 블록을 조작하려면 막대한 계산 비용이 필요
- **탈중앙화**: 누구나 채굴에 참여 가능
- **합의**: 가장 긴 체인이 정당한 체인으로 인정됨

## 🔐 체인 유효성 검증

블록체인의 유효성은 다음을 확인합니다:

1. 각 블록의 해시가 '0000'으로 시작하는가?
2. 각 블록의 parentHash가 이전 블록의 hash와 일치하는가?
3. Genesis Block이 올바르게 생성되었는가?

```javascript
// 체인이 유효한지 검증
const isValid = bitcoin.chainIsValid(bitcoin.chain);
```

## 🌐 분산 네트워크 시나리오

### 시나리오 1: 정상적인 블록 전파

1. 노드 1에서 트랜잭션 생성
2. 모든 노드에 트랜잭션 브로드캐스트
3. 노드 2에서 블록 채굴
4. 채굴된 블록이 모든 노드에 전파
5. 모든 노드가 동일한 체인 유지

### 시나리오 2: 체인 분기 (Fork)

1. 네트워크 지연으로 두 노드가 동시에 블록 채굴
2. 일시적으로 두 개의 체인 존재
3. 합의 알고리즘 실행 (`/consensus`)
4. 가장 긴 체인이 정당한 체인으로 채택
5. 짧은 체인은 버려짐

## 🧪 테스트 시나리오

### 기본 기능 테스트

```bash
# 1. 테스트 스크립트 실행
npm test

# 확인 사항:
# - Genesis Block 생성
# - 트랜잭션 생성 및 추가
# - Proof of Work 수행
# - 블록 생성
# - 해시 함수의 눈사태 효과
# - 체인 유효성 검증
```

### 네트워크 테스트

```bash
# 1. 3개의 노드 실행
npm run node_1  # 터미널 1
npm run node_2  # 터미널 2
npm run node_3  # 터미널 3

# 2. 노드 연결 (Postman 사용)
POST http://localhost:3001/register-and-broadcast-node
{ "newNodeUrl": "http://localhost:3002" }

POST http://localhost:3001/register-and-broadcast-node
{ "newNodeUrl": "http://localhost:3003" }

# 3. 트랜잭션 생성
POST http://localhost:3001/transaction/broadcast
{
  "amount": 100,
  "sender": "ALICE",
  "recipient": "BOB"
}

# 4. 블록 채굴
GET http://localhost:3002/mine

# 5. 모든 노드에서 블록체인 확인
GET http://localhost:3001/blockchain
GET http://localhost:3002/blockchain
GET http://localhost:3003/blockchain
```

## 📖 학습 포인트

### 1. 해시 함수의 특성
- **결정론적**: 같은 입력은 항상 같은 출력
- **눈사태 효과**: 입력의 작은 변화도 완전히 다른 해시 생성
- **일방향성**: 해시로부터 원본 데이터 복원 불가능
- **충돌 저항성**: 같은 해시를 가진 다른 입력 찾기 어려움

💡 **실습**: `npm run difficulty`로 난이도가 증가할 때 해시 계산 횟수가 기하급수적으로 증가하는 것을 확인하세요.

### 2. 블록체인의 불변성
- 과거 블록을 수정하려면 이후 모든 블록을 다시 채굴해야 함
- 네트워크가 클수록 조작이 어려움
- 가장 긴 체인이 정당한 체인

💡 **실습**: `npm run fork`로 체인 분기와 해결 과정을 시뮬레이션하세요.

### 3. 분산 합의
- 중앙 권한 없이 네트워크가 합의에 도달
- Proof of Work를 통한 블록 생성 권한 부여
- 가장 긴 체인 규칙 (Longest Chain Rule)

💡 **실습**: `npm run mining`으로 여러 채굴자가 경쟁하는 과정을 확인하세요.

### 4. 이중 지불 방지
- 트랜잭션은 블록에 포함되어야 확정
- 여러 확인 블록으로 보안 강화
- 체인 재구성 공격 방어

💡 **실습**: `npm run fork`의 51% 공격 시뮬레이션을 통해 이중 지불의 위험성을 이해하세요.

### 5. 성능과 확장성
- POW는 보안과 성능 사이의 트레이드오프
- 난이도 조절로 블록 생성 시간 제어
- 네트워크 해시파워와 보안의 관계

💡 **실습**: `npm run benchmark`로 실제 성능을 측정하고 최적화 방법을 탐구하세요.

## 🛠️ 기술 스택

- **Node.js**: 서버 사이드 JavaScript 런타임
- **Express**: 웹 애플리케이션 프레임워크
- **SHA-256**: 암호화 해시 함수
- **UUID**: 고유 식별자 생성
- **Request-Promise**: HTTP 클라이언트

## 📂 프로젝트 구조

```
bitcoin-pow-demo/
├── blockchain.js                # 블록체인 핵심 로직
├── networkNode.js              # 네트워크 노드 및 API 서버
├── test.js                     # 기본 테스트 스크립트
├── examples.js                 # 다양한 사용 예제
├── difficulty-simulator.js     # 난이도 시뮬레이터
├── fork-simulator.js           # Fork 시뮬레이터
├── performance-benchmark.js    # 성능 벤치마크
├── visualize-chain.js          # 체인 시각화 도구
├── mining-simulator.js         # 마이닝 시뮬레이터
├── package.json               # 프로젝트 설정
├── public/
│   └── index.html             # Explorer UI
├── README.md                  # 프로젝트 문서
가이드
```

## ⚠️ 주의사항

이 프로젝트는 **교육 목적**으로 만들어졌습니다:

- 실제 암호화폐로 사용하지 마세요
- 보안 기능이 단순화되어 있습니다
- 프로덕션 환경에 적합하지 않습니다

## 🎓 추가 학습 자료

- [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)
- [Blockchain Demo](https://andersbrownworth.com/blockchain/)
- [Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook)

## 📝 라이선스

MIT License

## 👨‍💻 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!

---

**Happy Coding! ⛏️🚀**



