# eventRewardControlPlatform

## ✅ API 명세서
### 🔐 1. 사용자 관련 (Auth)
| 메서드     | 경로                                   | 설명                           | 권한      |
| ------- | ------------------------------------ | ---------------------------- | ------- |
| `POST`  | `/auth/register`                     | 사용자 회원가입 (`role = guest`)    | 공개      |
| `POST`  | `/auth/login`                        | 로그인, JWT 토큰 발급               | 공개      |
| `PATCH` | `/auth/me/events`                   | 유저의 이벤트 조건 진행 현황 수정/추가       | user |
| `PATCH` | `/auth/:userId/role`                | 사용자 권한 변경 (`guest → user` 등) | admin   |
| `GET`   | `/auth/me`                          | 내 정보 조회                      | 인증      |
| `GET`   | `/auth/check-nickname?nickname=abc` | 닉네임 중복 여부 체크                 | 공개      |

### 🎯 2. 이벤트 관리
| 메서드     | 경로                        | 설명                                | 권한          |
| ------- | ------------------------- | --------------------------------- | ----------- |
| `POST`  | `/events`                 | 새 이벤트 등록 (조건 포함)                  | operator |
| `GET`   | `/events`                 | 이벤트 목록 조회                         | 전체          |
| `GET`   | `/events/:eventId`        | 이벤트 상세 조회                         | 전체          |
| `PATCH` | `/events/:eventId/status` | 이벤트 상태 변경 (ex: active → inactive) | operator 이상 |

### 🎁 3. 보상 / 보상 요청
| 메서드    | 경로                         | 설명                   | 권한          |
| ------ | -------------------------- | -------------------- | ----------- |
| `POST` | `/events/:eventId/rewards` | 이벤트에 대한 보상 등록        | operator 이상 |
| `POST` | `/events/:eventId/claim`   | 해당 이벤트에 보상 요청        | user 이상     |
| `GET`  | `/events/rewards`         | 전체 유저 보상 요청 기록 조회    | auditor 이상  |
| `GET`  | `/events/rewards/me`      | 내 보상 요청 이력 조회        | user 이상     |
| `GET`  | `/events/:eventId/rewards` | 특정 이벤트에 연결된 보상 목록 조회 | 전체          |

## 컬렉션 구조
```json
user 컬렉션
{
  "_id": ObjectId,
  "username": "ironblack",
  "password": "hashed_password_here", // bcrypt 등으로 해싱된 값
  "role": "user", // user | admin | auditor | operator | guest 
  "joinedAt": ISODate(),

  "eventProgress": [
    {
      "eventId": ObjectId("..."),
      "type": "login-streak",
      "current": {
        "login_days": 2
      },
      "lastUpdated": ISODate()
    },
    {
      "eventId": ObjectId("..."),
      "type": "watch-video",
      "current": {
        "videoId": "abc123",
        "watch_minutes": 7.5
      },
      "lastUpdated": ISODate()
    }
  ]
}
```

```json
reward_requests 보상 요청 기록
{
  "_id": ObjectId,
  "eventId": ObjectId("..."),
  "userId": ObjectId("..."),
  "status": "success",       // success | failed | pending
  "reason": null,            // 실패 사유 (조건 미충족 등)
  "requestedAt": ISODate(),
  "verifiedAt": ISODate()
}
```
```json
reward 보상 컬렉션
{
  "_id": ObjectId,
  "eventId": ObjectId("..."), // FK to events._id
  "rewardType": "point",      // point | item | coupon
  "amount": 100,              // 수량
  "itemCode": null,           // rewardType = item일 때
  "couponCode": null,         // rewardType = coupon일 때
  "description": "100 포인트 지급",
  "createdAt": ISODate()
}
```
```json
이벤트 컬렉션
{
  "_id": ObjectId,
  "name": "3일 연속 로그인 이벤트",
  "type": "login-streak",
  "description": "3일 연속 로그인 시 보상 지급",
  "conditions": {
    "login_days": 3
  },
  "status": "active",
  "startAt": ISODate("2025-05-15T00:00:00Z"),
  "endAt": ISODate("2025-06-15T23:59:59Z"),
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```