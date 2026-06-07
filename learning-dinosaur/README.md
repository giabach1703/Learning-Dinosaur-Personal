# 🦕 Learning Dinosaur

Learning Dinosaur là một web app Flashcard giúp người dùng tạo bộ thẻ học tập, ôn luyện kiến thức và duy trì thói quen học đều đặn thông qua điểm XP, streak và huy hiệu.

Ứng dụng phù hợp với học sinh, sinh viên, người học ngoại ngữ, người ôn thi chứng chỉ, lập trình viên chuẩn bị phỏng vấn hoặc bất kỳ ai cần ghi nhớ thông tin có cấu trúc.

---

## 1. Mục tiêu dự án

Learning Dinosaur được xây dựng với các mục tiêu chính:

- Tạo deck và flashcard nhanh chóng, đơn giản.
- Hỗ trợ học ngắn theo phiên, mỗi phiên tối đa 10 thẻ.
- Ưu tiên ôn lại các thẻ chưa thuộc, thẻ cần xem lại và thẻ cũ.
- Duy trì động lực học thông qua XP, cấp độ, streak và badges.
- Lưu dữ liệu thật theo tài khoản người dùng bằng database MySQL.
- Tách biệt frontend và backend, giao tiếp qua REST API.

---

## 2. Công nghệ sử dụng

### Frontend

- React
- Vite
- Ant Design
- React Router DOM
- Axios
- Recharts
- Dayjs

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT Authentication
- bcrypt

### Công cụ phát triển

- Visual Studio Code
- MySQL Workbench
- Thunder Client hoặc Postman
- Git / GitHub

---

## 3. Chức năng chính

### 3.1. Xác thực người dùng

- Đăng ký tài khoản bằng email và mật khẩu.
- Đăng nhập bằng email và mật khẩu.
- Mã hóa mật khẩu bằng bcrypt.
- Sử dụng JWT cho phiên đăng nhập.
- Bảo vệ API bằng middleware xác thực.
- Dữ liệu được phân tách theo từng tài khoản người dùng.

### 3.2. Quản lý Deck

Người dùng có thể:

- Tạo deck mới.
- Xem danh sách deck.
- Sửa tên, mô tả và tag của deck.
- Xóa deck.
- Lọc deck theo tag.
- Tìm kiếm deck theo tên, mô tả hoặc tag.

Mỗi deck hiển thị:

- Tên deck.
- Mô tả ngắn.
- Danh sách tag.
- Tổng số thẻ.
- Số thẻ đã thuộc.
- Thanh tiến độ học tập.

### 3.3. Tạo Deck kiểu Quizlet

Ứng dụng hỗ trợ giao diện tạo deck riêng, tương tự Quizlet:

- Nhập tiêu đề deck.
- Nhập mô tả deck.
- Gắn một hoặc nhiều tag.
- Nhập nhiều cặp Term / Definition cùng lúc.
- Tạo deck và toàn bộ flashcard trong một lần.
- Có nút “Tạo deck”.
- Có nút “Tạo và học ngay”.

### 3.4. Quản lý Card

Trong từng deck, người dùng có thể:

- Thêm thẻ mới.
- Sửa mặt trước và mặt sau của thẻ.
- Xóa thẻ.
- Xem danh sách thẻ dạng bảng.
- Tìm kiếm thẻ theo nội dung.
- Gắn cờ “Cần xem lại”.
- Xem trạng thái học của từng thẻ:
  - Mới.
  - Đã thuộc.
  - Chưa thuộc.
- Xem số lần đã học của từng thẻ.

### 3.5. Chế độ học

Người dùng có thể chọn một deck và bắt đầu học.

Trong chế độ học:

- Mỗi phiên học lấy tối đa 10 thẻ.
- Mỗi thẻ hiển thị mặt trước trước.
- Người dùng nhấn để xem mặt sau.
- Sau khi xem đáp án, người dùng chọn:
  - Đã thuộc.
  - Chưa thuộc.
- Thẻ đánh dấu Chưa thuộc sẽ quay lại cuối phiên cho tới khi được đánh dấu Đã thuộc.
- Người dùng có thể bật Shuffle để trộn thẻ ngẫu nhiên.
- Người dùng có thể bật “Chỉ học thẻ cần xem lại”.
- Người dùng có thể gắn cờ hoặc bỏ cờ “Cần xem lại” ngay trong lúc học.

Mỗi lượt học sẽ được ghi nhận:

- Trạng thái thẻ.
- `lastReviewed`.
- `reviewCount`.
- `StudyLog`.
- XP nhận được.
- Streak của người dùng.

### 3.6. Thuật toán chọn thẻ học

Khi bắt đầu một phiên học, hệ thống chọn tối đa 10 thẻ theo thứ tự ưu tiên:

1. Thẻ có trạng thái Chưa thuộc.
2. Thẻ được gắn cờ Cần xem lại.
3. Thẻ mới.
4. Thẻ có lần ôn cũ nhất.

Nếu deck có ít hơn 10 thẻ thì hệ thống lấy toàn bộ thẻ trong deck.

### 3.7. Tag

Ứng dụng hỗ trợ tag cho deck:

- Một deck có thể có nhiều tag.
- Người dùng có thể lọc deck theo tag.
- Tag đã dùng trước đó được gợi ý lại khi tạo hoặc sửa deck.
- Tag giúp người dùng nhóm deck theo chủ đề như TOEIC, tiếng Anh, lập trình, quản trị rủi ro, phỏng vấn.

### 3.8. Global Search

Ứng dụng có ô tìm kiếm toàn cục trên header.

Global Search hỗ trợ:

- Tìm deck theo tên, mô tả hoặc tag.
- Tìm card theo mặt trước hoặc mặt sau.
- Hiển thị kết quả ngay khi gõ.
- Phân biệt kết quả là Deck hoặc Card.
- Click vào kết quả để chuyển đến deck tương ứng.

### 3.9. Thống kê học tập

Trang thống kê hiển thị:

- Số thẻ đã học hôm nay.
- Tổng số thẻ đã thuộc.
- Tổng số lượt học.
- Streak hiện tại.
- Tổng XP.
- Cấp độ hiện tại.
- Biểu đồ hoạt động học trong 7 ngày gần nhất.

### 3.10. Streak Banner

Trang chủ có Streak Banner hiển thị:

- Streak hiện tại.
- Số thẻ đã học hôm nay.
- Tổng XP.
- Cấp độ hiện tại.
- Thông báo nếu hôm nay chưa học thẻ nào.
- Thông báo động viên nếu hôm nay đã học.

### 3.11. Gamification

Ứng dụng có cơ chế tạo động lực học gồm:

- XP.
- Cấp độ khủng long.
- Streak hằng ngày.
- Badges / Huy hiệu.

Mỗi thẻ được đánh dấu Đã thuộc sẽ cộng XP cho người dùng. Khi tích lũy đủ XP, người dùng sẽ tiến hóa theo các cấp độ:

- 🥚 Trứng Khủng Long
- 🦎 Khủng Long Bột
- 🦕 Khủng Long Học Việc
- 🦖 T-Rex Mê Học
- 🐉 Khủng Long Thông Thái
- ☄️ Khủng Long Bất Tử

### 3.12. Badges tự động

Ứng dụng tự động mở khóa huy hiệu khi người dùng đạt điều kiện.

Các badge hiện có:

- First Step: học thẻ đầu tiên.
- 7-Day Streak: học liên tục 7 ngày.
- 100 Cards: học đủ 100 lượt thẻ.
- Deck Finisher: hoàn thành toàn bộ một deck.
- Dinosaur Legend: đạt cấp Khủng Long Bất Tử.

Trang Thành tựu hiển thị cả badge đã đạt và chưa đạt.

---

## 4. Cấu trúc thư mục

Dự án gồm hai phần chính:

learning dinosaur/
├── README.md
├── learning-dinosaur/
│ └── frontend React
│
└── learning-dinosaur-backend/
└── backend Node.js Express
4.1. Frontend
learning-dinosaur/
├── public/
├── src/
│ ├── components/
│ │ ├── common/
│ │ ├── deck/
│ │ ├── gamification/
│ │ ├── stats/
│ │ └── study/
│ ├── constants/
│ ├── data/
│ ├── layouts/
│ ├── pages/
│ │ ├── AchievementsPage.jsx
│ │ ├── CreateDeckPage.jsx
│ │ ├── DeckDetailPage.jsx
│ │ ├── HomePage.jsx
│ │ ├── LoginPage.jsx
│ │ ├── RegisterPage.jsx
│ │ ├── StatisticsPage.jsx
│ │ └── StudyPage.jsx
│ ├── services/
│ │ ├── api.js
│ │ ├── authService.js
│ │ ├── badgeService.js
│ │ ├── cardService.js
│ │ ├── deckService.js
│ │ ├── searchService.js
│ │ ├── statsService.js
│ │ └── studyService.js
│ ├── utils/
│ ├── App.jsx
│ ├── index.css
│ └── main.jsx
├── package.json
└── vite.config.js
4.2. Backend
learning-dinosaur-backend/
├── prisma/
│ ├── migrations/
│ ├── schema.prisma
│ └── seed.js
├── src/
│ ├── config/
│ │ └── prisma.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── badgeController.js
│ │ ├── cardController.js
│ │ ├── deckController.js
│ │ ├── searchController.js
│ │ ├── statsController.js
│ │ └── studyController.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ └── errorMiddleware.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── badgeRoutes.js
│ │ ├── cardRoutes.js
│ │ ├── deckRoutes.js
│ │ ├── searchRoutes.js
│ │ ├── statsRoutes.js
│ │ └── studyRoutes.js
│ ├── services/
│ │ └── badgeService.js
│ ├── utils/
│ │ └── jwt.js
│ ├── app.js
│ └── server.js
├── .env
├── package.json
└── package-lock.json 5. Cài đặt và chạy dự án
5.1. Yêu cầu môi trường

Cần cài sẵn:

Node.js
npm
MySQL Server
MySQL Workbench
Visual Studio Code
5.2. Tạo database MySQL

Mở MySQL Workbench và chạy:

CREATE DATABASE learning_dinosaur
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
5.3. Cài đặt backend

Mở terminal:

cd "D:\learning dinosaur\learning-dinosaur-backend"
npm install

Tạo file .env trong thư mục backend:

DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/learning_dinosaur"
JWT_SECRET="learning_dinosaur_secret_key_2026"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"

Lưu ý: thay YOUR_MYSQL_PASSWORD bằng mật khẩu MySQL thật trên máy của bạn.

Chạy migration để tạo bảng trong database:

npx prisma migrate dev --name init

Generate Prisma Client:

npx prisma generate

Chạy backend:

npm run dev

Backend sẽ chạy tại:

http://localhost:5000

Kiểm tra backend bằng trình duyệt:

http://localhost:5000

Kết quả mong muốn:

{
"message": "Learning Dinosaur API is running"
}
5.4. Cài đặt frontend

Mở terminal khác:

cd "D:\learning dinosaur\learning-dinosaur"
npm install
npm run dev

Frontend sẽ chạy tại:

http://localhost:5173 6. Seed dữ liệu demo

Dự án có file seed để tạo dữ liệu mẫu phục vụ demo.

Chạy trong thư mục backend:

cd "D:\learning dinosaur\learning-dinosaur-backend"
npm run seed

Sau khi chạy thành công, hệ thống tạo tài khoản demo:

Email: demo@learningdinosaur.com
Password: 123456

Dữ liệu demo gồm:

3 deck mẫu:
TOEIC Vocabulary
Risk Management Basics
JavaScript Interview
Nhiều flashcard mẫu.
Một số thẻ đã thuộc.
Một số thẻ chưa thuộc.
Một số thẻ được gắn cờ cần xem lại.
Study logs trong 7 ngày.
XP, streak và badges mẫu.

Lưu ý:

Không cần chạy npm run seed mỗi lần chạy dự án.
Chỉ chạy seed khi muốn tạo mới hoặc reset dữ liệu demo. 7. Cách chạy dự án hằng ngày

Mỗi lần mở dự án, chỉ cần chạy 2 terminal.

Terminal 1: Backend
cd "D:\learning dinosaur\learning-dinosaur-backend"
npm run dev
Terminal 2: Frontend
cd "D:\learning dinosaur\learning-dinosaur"
npm run dev

Sau đó mở:

http://localhost:5173 8. API chính
8.1. Auth
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
8.2. Deck
GET /api/decks
POST /api/decks
GET /api/decks/:deckId
PUT /api/decks/:deckId
DELETE /api/decks/:deckId
GET /api/decks/tags/all
8.3. Card
GET /api/cards
PUT /api/cards/:cardId
DELETE /api/cards/:cardId
PATCH /api/cards/:cardId/review-flag
GET /api/decks/:deckId/cards
POST /api/decks/:deckId/cards
8.4. Study
GET /api/study/decks/:deckId/session
GET /api/study/decks/:deckId/session?reviewOnly=true
POST /api/study/cards/:cardId/review
8.5. Statistics
GET /api/stats/overview
GET /api/stats/weekly
8.6. Search
GET /api/search?q=keyword
8.7. Badges
GET /api/badges 9. Luồng demo đề xuất

Khi thuyết trình, có thể demo theo thứ tự:

Đăng nhập bằng tài khoản demo.
Xem HomePage:
Deck mẫu.
Streak.
XP.
Level.
Sử dụng Global Search để tìm deck/card.
Tạo deck mới theo giao diện kiểu Quizlet.
Nhập nhiều Term / Definition.
Tạo và học ngay.
Lật thẻ.
Chọn Đã thuộc / Chưa thuộc.
Gắn cờ Cần xem lại.
Bật chế độ Chỉ học thẻ cần xem lại.
Xem Statistics.
Xem Achievements.
Mở MySQL Workbench để chứng minh dữ liệu lưu thật trong database. 10. Kiểm thử chức năng

Checklist kiểm thử:

- Đăng ký được tài khoản mới.
- Đăng nhập được.
- Đăng xuất được.
- Tạo deck được.
- Sửa deck được.
- Xóa deck được.
- Tạo nhiều card cùng lúc được.
- Thêm card trong deck được.
- Sửa card được.
- Xóa card được.
- Gắn cờ cần xem lại được.
- Học flashcard được.
- Shuffle hoạt động.
- Chỉ học thẻ cần xem lại hoạt động.
- Thẻ Chưa thuộc quay lại cuối phiên.
- XP tăng sau khi học.
- Streak cập nhật sau khi học.
- Statistics cập nhật.
- Badges tự động mở khóa.
- Global Search tìm được deck và card.
- Refresh trình duyệt không mất dữ liệu.

11. Bảo mật

Dự án đã áp dụng các cơ chế bảo mật cơ bản:

Mật khẩu được mã hóa bằng bcrypt.
API xác thực bằng JWT.
Các route quản lý deck, card, study, stats, search và badges yêu cầu token.
Dữ liệu được phân tách theo user.
User chỉ xem và thao tác được dữ liệu của chính mình.

Dự án: Learning Dinosaur
Mục đích: Bài thực hành / đồ án xây dựng web app Flashcard
Công nghệ chính: React, Node.js, Express, Prisma, MySQL
