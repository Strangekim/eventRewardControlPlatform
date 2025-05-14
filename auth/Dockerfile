# 1. Node.js 18 버전의 경량 이미지 사용
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json 및 lock 파일 복사
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 전체 코드 복사
COPY . .

# 6. NestJS 프로젝트 빌드
RUN npm run build

# 7. 앱 실행 (빌드된 JS 파일 실행)
CMD ["npm", "run", "start:dev"]
