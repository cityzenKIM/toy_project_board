# NestJS 게시판 API

# 사용 기술

- typescript
- nestjs
- rest api
- typeorm
- mysql
- github actions

# REST API 문서
http://3.39.250.34/docs

# 구현 사항

1. 로그인 / 회원가입

- 일반 로그인 구현(jwt)
- 리프레시 토큰 사용
- 토큰 만료 시 재발급
- 유저는 일반 유저와 관리자로 나뉨

2. 글 카테고리

- 공지사항, Q&A, 1:1문의
- 공지사항은 관리자만 생성, 수정, 삭제 가능
- 카테고리별 조회 가능

3. 글 crud
   
- 글 작성시 aws s3를 이용한 이미지 업로드 기능

4. 글 정렬
   
- 최신순
- 인기순(조회순) - 전체기간, 일년, 한달, 일주일 기준
- 조회할 때마다 PostView 엔티티에 기록을 추가하고, 기간별 조회수를 기준으로 정렬

5. 글 검색(기준)

- 전체(글 제목 + 글 작성자)
- 글 제목
- 글 작성자

6. 댓글, 대댓글 crud
   
- 부모/자식 관계 형성을 통해 대댓글 구현
- 해당 글의 모든 댓글/대댓글들을 계층 구조를 만들어서 전달

   

**7. 테스트 코드(유닛테스트 작성) (미구현)**


# CI/CD 워크플로우
1. GitHub Actions 설정
- github/workflows/deploy.yml 파일에 설정
- Docker 이미지 빌드, Docker Hub에 푸시, EC2 인스턴스에 배포
2. EC2 인스턴스 설정
- EC2 인스턴스에 Docker 설치
- Docker Hub에서 이미지 풀 및 실행
