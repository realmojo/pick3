# 네이버 검색 API 설정 가이드

네이버 블로그 검색 API를 사용하여 장소 상세 페이지에 블로그 리뷰를 표시하기 위한 설정 방법입니다.

## 1. 네이버 개발자 센터 가입 및 애플리케이션 등록

### 1-1. 네이버 개발자 센터 접속
- https://developers.naver.com/main/ 접속
- 네이버 계정으로 로그인

### 1-2. 애플리케이션 등록
1. 상단 메뉴에서 **Application > 애플리케이션 등록** 클릭
2. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: Pick3 (또는 원하는 이름)
   - **사용 API**: **검색** 선택
   - **환경 추가**:
     - **WEB 설정** 선택
     - 서비스 URL: `http://localhost:3000` (개발 환경)
     - 배포 후에는 실제 도메인 추가 (예: `https://yourdomain.com`)

3. 등록 완료 후 **Client ID**와 **Client Secret** 확인

## 2. 환경 변수 설정

### 2-1. .env.local 파일 수정
프로젝트 루트의 `.env.local` 파일을 열고 다음 값을 입력:

```bash
# Naver Search API
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
```

### 예시:
```bash
NAVER_CLIENT_ID=AbCd1234EfGh5678
NAVER_CLIENT_SECRET=XyZ9876WxY4321
```

## 3. 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작해야 합니다:

```bash
npm run dev
```

## 4. 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 원하는 카테고리(카페/맛집/휴양지) 선택
3. 검색 결과에서 **상세보기** 버튼 클릭
4. 장소 상세 페이지에서 **블로그 리뷰** 섹션 확인

## 5. API 사용량 제한

- **무료 한도**: 하루 25,000회 호출
- **호출당 결과**: 최대 100건
- **주의**: 한도 초과 시 API 호출이 차단될 수 있으므로 적절한 캐싱 전략 권장

## 6. 배포 시 주의사항

### Cloudflare Pages 배포 시
1. Cloudflare Pages 대시보드 > 프로젝트 > Settings > Environment variables
2. 다음 환경 변수 추가:
   - `NAVER_CLIENT_ID`: 네이버 Client ID
   - `NAVER_CLIENT_SECRET`: 네이버 Client Secret
   - `KAKAO_REST_API_KEY`: 카카오 REST API 키

### 네이버 개발자 센터 설정 업데이트
1. 애플리케이션 설정 > Web 설정
2. 배포된 도메인 URL 추가 (예: `https://your-project.pages.dev`)

## 구현된 기능

### 장소 상세 페이지
- 장소 기본 정보 (이름, 주소, 전화번호)
- 카테고리별 대표 이미지
- 카카오맵 링크 및 길찾기 버튼
- **네이버 블로그 리뷰 목록** (NEW!)
  - 장소명 + 카테고리 조합으로 검색
  - 유사도순 정렬
  - 최대 10개의 최신 블로그 포스트 표시
  - 블로그 제목, 요약, 작성자, 작성일 표시
  - 클릭 시 원본 블로그 포스트로 이동

## API 엔드포인트

### GET /api/naver/blog
네이버 블로그 검색 API 프록시

**쿼리 파라미터:**
- `query` (필수): 검색어
- `display` (선택): 결과 개수 (기본값: 5, 최대: 100)
- `start` (선택): 검색 시작 위치 (기본값: 1, 최대: 1000)
- `sort` (선택): 정렬 방식 (`sim` 유사도순, `date` 날짜순, 기본값: `sim`)

**응답 예시:**
```json
{
  "total": 1234,
  "start": 1,
  "display": 5,
  "items": [
    {
      "title": "맛집 <b>후기</b>",
      "link": "https://blog.naver.com/...",
      "description": "정말 맛있었어요...",
      "bloggername": "맛집헌터",
      "bloggerlink": "https://blog.naver.com/user",
      "postdate": "20260216"
    }
  ]
}
```

## 문제 해결

### API 호출 실패 시
1. `.env.local` 파일의 Client ID와 Secret 확인
2. 개발 서버 재시작
3. 네이버 개발자 센터에서 사용 API에 "검색" 선택 확인
4. 콘솔에서 에러 메시지 확인

### 블로그 리뷰가 표시되지 않을 때
- 검색 결과가 없을 수 있음 (정상 동작)
- 네트워크 탭에서 `/api/naver/blog` 요청 상태 확인
- 장소명이 너무 특이하거나 신규 장소일 경우 리뷰가 없을 수 있음
