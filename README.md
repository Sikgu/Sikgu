# 🌱 프로젝트 협업 가이드

본 문서는 Git 브랜치 전략, 커밋 메시지 규칙, 코드 리뷰 규칙, GitHub Issue 템플릿, 그리고 GitHub Actions(CI/CD) 설정 가이드를 포함합니다.
현재 계속 수정 중으로 GitHub Issue 템플릿, 그리고 GitHub Actions(CI/CD) 설정 가이드는 추후 수정 예정
도커 사용 여부에 따라 추가 예정

---

## 1. 브랜치 전략

- **`main`**
  - 안정 버전을 관리
  - 배포 가능한 상태만 병합
  - 직접 커밋 금지 (`dev` → `main` 병합만 허용)

- **`dev`**
  - 개발 통합 브랜치
  - 모든 기능 브랜치는 `dev`에서 분기
  - 테스트 완료 후만 병합

- **`feature/*`**
  - 개별 기능 개발 브랜치
  - 네이밍 규칙:
    - 프론트엔드: `feature/frontend-기능명`
    - 백엔드: `feature/backend-기능명`
  - 작업 완료 후 `dev` 브랜치로 Pull Request 생성

---

## 2. 코드 스타일

추가 예정

---

## 3. 커밋 메시지 규칙

- **형식**
  ```
  [#이슈번호] 타입: 작업 내용
  ```

- **타입 예시**
  - `feat`: 새로운 기능 추가
  - `fix`: 버그 수정
  - `docs`: 문서 수정
  - `style`: 코드 포맷 변경 (로직 변화 없음)
  - `refactor`: 코드 리팩토링
  - `test`: 테스트 코드 추가/수정
  - `chore`: 빌드/도구 설정 변경

- **예시**
  ```
  [#12] feat: 로그인 API 구현
  [#14] fix: 회원가입 시 이메일 중복 버그 수정
  [#21] refactor: DB 쿼리 최적화
  ```

---

## 4. 코드 리뷰 규칙

1. **Pull Request 생성 시**
   - PR 제목: `[브랜치명] 작업 요약`
   - PR 본문: 작업 내용, 변경 이유, 테스트 방법 기재
   - 리뷰어 최소 1명 지정

2. **리뷰어 규칙**
   - 변경 파일 확인 후 **로직, 코드 스타일, 성능, 보안** 관점에서 검토
   - 필요한 경우 **수정 요청 (Request changes)**

3. **병합 조건**
   - 리뷰어 1명 이상 승인
   - CI/CD 빌드 및 테스트 통과
   - 최신 `dev`로 리베이스 후 병합

4. **PR 병합 후**
   - 해당 기능 브랜치 삭제

---

## 5. GitHub Issue 템플릿

**📄 기능 요청 (Feature Request)**

```
---
name: Feature request
about: 새로운 기능을 제안합니다.
title: "[Feature] "
labels: feature
assignees: ''
---

## 📌 기능 설명
설명 작성

## ✅ 작업 항목
- [ ] 작업 1
- [ ] 작업 2

## 🔗 관련 이슈
#이슈번호
```

**🐞 버그 리포트 (Bug Report)**

```
---
name: Bug report
about: 버그를 보고합니다.
title: "[Bug] "
labels: bug
assignees: ''
---

## 🐞 버그 설명
버그 내용 작성

## 📋 재현 방법
1. ...
2. ...
3. ...

## ✅ 예상 동작
예상되는 정상 동작 설명

## 🔗 관련 이슈
#이슈번호
```

---
<!--
## 6. GitHub Actions (CI/CD)

아래 예시는 **Spring Boot + React** 프로젝트를 대상으로  
PR 생성 시 **백엔드 빌드/테스트**와 **프론트엔드 빌드 검사**를 자동 실행하는 워크플로우입니다.

`.github/workflows/ci.yml`
```yaml
name: CI

on:
  pull_request:
    branches: [ "dev" ]

jobs:
  backend:
    name: Backend Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Gradle
        working-directory: backend
        run: ./gradlew build

  frontend:
    name: Frontend Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: frontend
        run: npm install
      - name: Build React app
        working-directory: frontend
        run: npm run build
```

---
-->
## 7. 작업 예시

```bash
# dev에서 브랜치 생성
git checkout dev
git pull origin dev
git checkout -b feature/backend-login

# 작업 후 커밋
git add .
git commit -m "[#12] feat: 로그인 API 구현"

# 원격 저장소에 푸시
git push origin feature/backend-login

# GitHub에서 PR 생성 → 리뷰 → dev에 병합
```

---

✅ 이 문서와 워크플로우를 사용하면,  
브랜치 관리 → 커밋 규칙 → 코드 리뷰 → 자동 빌드/테스트까지  
모든 협업 프로세스를 표준화할 수 있습니다.
