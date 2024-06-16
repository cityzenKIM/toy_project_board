# v8ightcorp_project

# 사용 기술

- typescript
- nestjs
- rest api
- typeorm
- mysql
- jest
- github actions
- 그 외 다른 라이브러리 사용 가능

# 구현 사항


1. 로그인 / 회원가입

- 일반 로그인 구현(jwt)
- 리프레시 토큰 사용
- 토큰 만료 시 재발급

2. 글 카테고리

- 공지사항, Q&A, 1:1문의

3. 글 crud

- 글 작성 시 이미지 업로드 가능
- aws s3 사용(실제로 연결해보고 잘 돌아가는 지 확인)

4. 글 정렬

- 최신순
- 인기순(조회순) - 전체기간, 일년, 한달, 일주일 기준

5. 글 검색(기준)

- 전체(글 제목 + 글 작성자)
- 글 제목
- 글 작성자

6. 댓글, 대댓글 crud
7. 테스트 코드(유닛테스트 작성)

## 상세 사항

- 유저는 일반 유저와 관리자로 나뉨
- 공지사항은 관리자만 생성, 수정, 삭제 가능
- 삭제는 soft delete로 구현
- 각 항목 delete 시 연관된 데이터 함께 soft delete
- github actions를 이용해 main branch에 push 시 테스트 실행 후 ec2 인스턴스로 자동 배포
- docker를 이용해 ec2에 배포
- 같은 ec2 인스턴스 로컬 환경에 mysql 설치 후 서버 실행
- 과제 완료 후 ec2 인스턴스 접근 가능한 ip 주소와 github 레포 전달
