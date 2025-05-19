# 🎉 이벤트 / 보상 관리 플랫폼
안녕하세요 PM님!
말씀하신 수작업 이벤트 관리의 비효율을 해결하고, 운영자·유저·감사자 각각의 역할을 고려한 **이벤트/보상 관리 플랫폼**을 완성했습니다.
이제 운영자는 자유롭게 이벤트를 생성하고 보상을 등록할 수 있으며, 유저는 조건을 만족한 후 직접 보상 요청이 가능합니다.
모든 내역은 역할에 따라 조회 및 관리할 수 있어, **정확하고 투명한 운영**이 가능합니다.
실제 사내 도구로도 사용될 수 있도록 **확장성과 유지보수성**을 고려하여 설계했습니다. 

확인해보시고 개선사항이 있다면 언제든 말씀 주세요! 

---


## 실행 방법
0. Docker 환경 준비
  - Docker, Docker Compose가 설치되어 있어야 합니다.

1. Docker 컨테이너 빌드 및 실행

```bash
docker compose up --build
```

2. 접속 경로
API 접근 : http://{IP}:3000/

3. 초기 Admin 계정 생성 가이드
  - 서비스에 접근하기 위해서 최소 1개의 ADMIN 계정이 필요합니다.
  - 최초 실행 시에는 `auth/controller/public.controller.ts` 내의 **역할 변경 권한 예외 처리 부분을 잠시 주석 처리**하여, 권한 없이도 역할 변경이 가능하도록 설정해주세요.

4. **.env 파일을 변경 해주세요!**
  - 빠른 테스트를 위해 `.env` 파일 예시를 함께 업로드해두었습니다.
  - **실제 운영 환경에서는 보안상 .env 파일을 절대 공개하지 말아주세요.**
  - 각 서비스 디렉토리(`auth/`, `event/`, `gateway/`)에 `.env` 파일이 존재해야 정상 실행됩니다.

---


## 🔐 사용자 등록 및 권한 승격 흐름 요약

### 1️⃣ 사용자 가입 및 초기 권한 설정

- 모든 사용자는 `/auth/register` API를 통해 가입합니다.
- 회원가입 시, 자동으로 `role: guest`로 설정됩니다.
- 게스트는 로그인은 가능하지만, 이외의 **어떠한 API**도 호출할 수 없습니다.
```ts
{
  "eventProgress": [],
  "_id": ObjectId("..."),,
  "username": "auditor",
  "password": "hashed...",
  "role": "auditor",
  "joinedAt": ISODate()
}
```
🎯 guest 역할 도입 이유
 - 가입 즉시 `user` 역할을 부여할 경우,
**권한 검증 없이 이벤트 참여 및 보상 요청이 가능해져 기능상 허점**이 발생함.
- 따라서 모든 신규 계정은 `guest`로 등록되며, **관리자(admin)의 승인이 있어야 권한이 격상**됩니다.

---

### 2️⃣ 관리자에 의한 역할 격상

- 관리자 계정은 `PATCH /auth/user/:userId/role` API를 통해 사용자의 역할을 변경할 수 있습니다.
- 관리자만 이 API에 접근 가능하며, **역할 변경 전에는 엄격한 권한 검사**가 수행됩니다.

--- 

### 3️⃣ 역할에 따른 접근 제한

- `gateway` 서버는 모든 요청의 JWT를 검사하고, `x-user-role` 헤더로 사용자 역할을 내부 서비스에 전달합니다.
- 내부 서비스들은 이 헤더를 기반으로 역할 권한을 자체적으로 검증합니다.

---

### 4️⃣ 토큰 발급 및 인증 처리

- 로그인 시 `/auth/login` API를 호출하여 JWT 토큰을 발급받습니다.
- 이 토큰은 이후 모든 API 호출 시 `Authorization: Bearer <token>` 형식으로 사용되어야 합니다.
- `gateway` 서버는 토큰이 유효하면 내부적으로 사용자 정보를 파싱하여 다음 서비스에 헤더로 전달합니다

--- 

### ✅ 예시 흐름: 신규 사용자 가입 후 권한 격상까지
1. `POST /auth/signup` → `role: guest`로 가입

2. `PATCH /auth/user/:username/role` (관리자) → `role: user`로 승격

3. `POST /event/:id/join` → 이벤트 참여 가능

4. `POST /event/:id/reward-request` → 조건 만족 시 보상 수령

--- 



## 📦 이벤트, 보상 등록 및 요청과 보상 지급 흐름 요약 

### 1️⃣ 이벤트 등록

- **관리자** 또는 **운영자**가 `/event/create` 엔드포인트로 새로운 이벤트를 생성합니다.
- 이벤트는 다음 정보를 포함합니다:
```ts
{
  "name": "3일 연속 로그인 이벤트",
  "type": "login-streak",
  "conditions": { "days": 3 },
  "status": "active",
  "startAt": "2025-05-15T00:00:00Z",
  "endAt": "2025-06-15T23:59:59Z"
}
```
- 생성된 이벤트는 `event` 서비스의 MongoDB에 저장됩니다.

---

### 2️⃣ 보상 등록
- 등록된 이벤트에 대해 운영자는 `/event/:id/reward` API를 통해 보상을 추가합니다.
- 보상은 `point`, `item`, `coupon` 타입을 가집니다.
- 이벤트 보상은 다음 정보를 포함합니다:
```ts
{
  "_id": ObjectId("..."),
  "eventId": ObjectId("..."), // 이벤트 ID를 외래키로 가집니다.
  "rewardType": "point",
  "amount": 100,
  "description": "100 포인트 지급",
  "createdAt": ISODate()
}
```

---

### 3️⃣ 사용자 이벤트 참여
- 사용자가 `/event/:id/join API`를 통해 이벤트에 참여합니다.
- 라우팅 흐름 :
  - 1. 유저가 `POST /event/:id/join` 호출
  - 2. Gateway 서버 → `event-service`
  - 3. `event-service` → 내부 HTTP 요청 → `auth-service`
- 참여 시, `auth-service`의 `user` 컬렉션에서 해당 유저의 `eventProgress` 배열에 새 항목이 다음과 같이 기록됩니다:

```ts
{
  "eventId": "6629e2b1234abcde5678f000",
  "type": "login-streak",
  "current": {
    "days": 3
  },
  "lastUpdated": ISODate(),
  "rewardReceived": false
}
```

---

### 4️⃣ 보상 요청 및 수령
- 사용자가 `/event/:id/reward-request` API를 호출하여 보상을 수령합니다.
- 라우팅 흐름 :
  - 1. 유저가 `POST /event/:id/reward` 호출
  - 2. `event-service`가 `auth-service`의 내부 API 호출
  - 3. `auth-service` → `user.eventProgress[*].rewardReceived` 성공시 true로 전환
  - 4. `event-service` 성공/실패 기록 로그 저장
- 보상 요청 이력이 다음과 같이 기록됩니다.

```ts
{
  "userId": ObjectId("..."),
  "eventId": ObjectId("..."),
  "processedAt": ISODate(),
  "status": "success" | "fail",
  "reason": "조건 미달" // 실패 시만 포함
}
```

---



## ✅ 내 서비스의 장단점

### 👍 장점
- guest 권한 도입으로 **운영자, 감시자의 이벤트 부정 수급, 내역 확인등의 행위를 원천 차단**할 수 있습니다.
- **다양한 형태**의 이벤트와, 보상 등록, 유저의 보상 지급 상태를 **유연하게 관리**할 수 있습니다.
- **Microservice 구조 기반 명확한 책임 분리**로, 유지보수와 확장성에 강한 구조를 가졌습니다.


### 🔧 시간이 남는다면, 이런 리펙토링을...
- **공통 예외 처리 추상화**
  - 각 서비스에서 반복되는 에러 핸들링을 `CustomErrorHandler` 클래스 등으로 통합.
- **페이지네이션 도입**
  - 서비스 관리자의 요구에 맞게 페이지네이션 도입.
- **이벤트 조건 달성도 세분화**
  - ex: "10명의 친구 초대 시 보상 지급" 이벤트에서, 3명, 5명, 10명 단위로 세분화된 달성률 구현
  - 별도의 컬렉션을 추가해 각 유저의 현재 조건 달성 현황 추적 가능하게 개선.

---



## ✅ API 명세서
### 🔐 AUTH API 명세서
| 메서드   | 경로                        | 설명           | 권한                    | DTO 구조 / Body 요청                                               |
| ----- | ------------------------- | ------------ | --------------------- | -------------------------------------------------------------- |
| POST  | `/auth/register`          | 회원가입         | ❌ 누구나 가능              | `username: string`<br>`password: string`<br>`nickname: string` |
| POST  | `/auth/login`             | 로그인 (JWT 발급) | ❌ 누구나 가능              | `username: string`<br>`password: string`                       |
| GET   | `/auth/users`             | 전체 유저 목록 조회  | ✅ `operator`, `admin` | 없음                                                             |
| PATCH | `/auth/user/:userId/role` | 유저 역할 변경     | ✅ `admin`만 가능         | `role: 'user' \| 'operator' \| 'admin' \| 'auditor'`           |
`           |


### 📘 EVENT API 명세서
| 메서드   | 경로                                     | 설명           | 권한                               | DTO 구조 / Body 요청                                                                                                 |
| ----- | -------------------------------------- | ------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST  | `/event/create`                        | 이벤트 생성       | ✅ `operator`, `admin`            | `name: string`<br>`description: string`<br>`startDate: Date`<br>`endDate: Date`                                  |
| GET   | `/event`                               | 모든 이벤트 목록 조회 | ✅ `operator`, `admin`            | 없음                                                                                                               |
| GET   | `/event/:id`                           | 특정 이벤트 상세 조회 | ✅ `operator`, `admin`            | 없음                                                                                                               |
| PATCH | `/event/:id/status`                    | 이벤트 마감 처리    | ✅ `operator`, `admin`            | 없음                                                                                                               |
| POST  | `/event/:id/reward`                    | 보상 등록        | ✅ `operator`, `admin`            | `rewardType: 'point' \| 'item' \| 'coupon'`<br>`amount?: number`<br>`itemCode?: string`<br>`couponCode?: string` |
| POST  | `/event/:id/join`                      | 이벤트 참여       | ✅ `user`, `admin`                | 없음                                                                                                               |
| POST  | `/event/:id/reward-request`            | 보상 요청        | ✅ `user`, `admin`                | 없음                                                                                                               |
| GET   | `/event/reward-request/mine`           | 내 보상 수령 이력   | ✅ `user`, `admin`                | 없음                                                                                                               |
| GET   | `/event/reward-request/all`            | 전체 보상 이력     | ✅ `operator`, `admin`, `auditor` | 없음                                                                                                               |
| GET   | `/event/reward-request/event/:eventId` | 특정 이벤트 보상 이력 | ✅ `operator`, `admin`, `auditor` | 없음                                                                                                               |
                                                                                                          |

---



## 📁 관련 데이터 컬렉션 구조 요약
🔹 `user` 컬렉션
```ts
{
  "eventProgress": [],
  "_id": ObjectId("..."),,
  "username": "auditor",
  "password": "hashed...",
  "role": "auditor",
  "joinedAt": ISODate()
}
```

🔹 `event` 컬렉션
```ts
{
  _id: ObjectId,
  name: string,
  type: string,
  conditions: Record<string, any>,
  status: "active" | "inactive",
  startAt: Date,
  endAt: Date
}
```
🔹 `reward` 컬렉션
```ts
{
  _id: ObjectId,
  eventId: ObjectId,
  rewardType: "point" | "item" | "coupon",
  amount?: number,
  itemCode?: string,
  couponCode?: string
}
```
🔹 `rewardRequest` 컬렉션
```ts
{
  userId: ObjectId,
  eventId: ObjectId,
  processedAt: Date,
  status: "success" | "fail",
  reason?: string
}
```