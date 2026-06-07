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

- **React 17** — thư viện UI
- **UmiJS v3** — framework React (routing, model, build toolchain)
- **TypeScript** — ngôn ngữ chính của toàn bộ frontend
- **Ant Design v4** — component UI
- **Axios** — gọi REST API
- **Recharts** — biểu đồ thống kê học tập
- **Dayjs** — xử lý ngày tháng

### Backend

- **Node.js** — runtime
- **Express.js v5** — web framework
- **TypeScript** — ngôn ngữ chính của toàn bộ backend
- **Prisma ORM v6** — truy vấn database, migration, seed
- **MySQL** — database quan hệ
- **JWT (jsonwebtoken)** — xác thực phiên đăng nhập
- **bcrypt** — mã hóa mật khẩu
- **Zod** — validation dữ liệu đầu vào
- **Google Auth Library** — hỗ trợ đăng nhập bằng Google OAuth
- **ts-node-dev** — chạy TypeScript dev server với hot reload

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
- Đăng nhập bằng Google OAuth.
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

### 3.3. Tạo Deck kiểu Dinosaur

Ứng dụng hỗ trợ giao diện tạo deck riêng, tương tự Quizlet:

- Nhập tiêu đề deck.
- Nhập mô tả deck.
- Gắn một hoặc nhiều tag.
- Chọn ngôn ngữ mặt trước / mặt sau cho từng thẻ.
- Nhập nhiều cặp Term / Definition cùng lúc với rich text editor.
- Tải ảnh minh họa lên từng thẻ (không giới hạn).
- Tạo deck và toàn bộ flashcard trong một lần.
- Có nút "Tạo deck".
- Có nút "Tạo và học ngay".

### 3.4. Quản lý Card

Trong từng deck, người dùng có thể:

- Thêm thẻ mới.
- Sửa mặt trước và mặt sau của thẻ (rich text editor).
- Xóa thẻ.
- Xem danh sách thẻ dạng bảng.
- Tìm kiếm thẻ theo nội dung.
- Gắn cờ "Cần xem lại".
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
- Người dùng có thể bật "Chỉ học thẻ cần xem lại".
- Người dùng có thể gắn cờ hoặc bỏ cờ "Cần xem lại" ngay trong lúc học.
- Cài đặt phiên học được lưu tự động vào localStorage.
- Nhấn nút "Học" từ trang chủ sẽ tự động bắt đầu phiên học ngay (autoStart).
- Sau khi hoàn thành, hiển thị gợi ý deck liên quan để học tiếp.

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

Ứng dụng có ô tìm kiếm toàn cục trên header (icon kính lúp, bấm vào mở popup search).

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

- 🥚 Trứng Khủng Long (0 XP)
- 🦎 Khủng Long Bột (100 XP)
- 🦕 Khủng Long Học Việc (300 XP)
- 🦖 T-Rex Mê Học (700 XP)
- 🐉 Khủng Long Thông Thái (1500 XP)
- ☄️ Khủng Long Bất Tử (3000 XP)

Streak và XP được hiển thị ngay trên Header app ở cả desktop và mobile.

### 3.12. Badges tự động

Ứng dụng tự động mở khóa huy hiệu khi người dùng đạt điều kiện.

Các badge hiện có:

- First Step: học thẻ đầu tiên.
- 7-Day Streak: học liên tục 7 ngày.
- 100 Cards: học đủ 100 lượt thẻ.
- Deck Finisher: hoàn thành toàn bộ một deck.
- Dinosaur Legend: đạt cấp Khủng Long Bất Tử.

Trang Thành tựu hiển thị cả badge đã đạt và chưa đạt.

### 3.13. Giải pháp chuyên gia

Trang Giải pháp chuyên gia cung cấp:

- Tìm kiếm lời giải sách giáo khoa theo tên, mã ISBN hoặc câu hỏi.
- Phân loại theo môn học: Toán, Khoa học, Ngôn ngữ, Kinh doanh, Nghệ thuật, Khoa học xã hội.
- Danh sách sách giáo khoa phổ biến mỗi môn.
- Xem lời giải từng bài tập có giải thích từng bước.

### 3.14. Thư mục (Folders)

Người dùng có thể tổ chức deck vào thư mục:

- Tạo thư mục mới từ Sidebar.
- Lọc deck theo thư mục.
- Dữ liệu thư mục lưu vào localStorage.

---

## 4. Cấu trúc thư mục

Dự án gồm hai phần chính:

```
Learning-Dinosaur/
├── README.md
├── learning-dinosaur/          ← Frontend (UmiJS + TypeScript)
└── learning-dinosaur-backend/  ← Backend (Node.js + TypeScript)
```

### 4.1. Frontend

```
learning-dinosaur/
├── src/
│   ├── components/
│   │   ├── common/             ← AppHeader, AppSidebar, GlobalSearch
│   │   ├── card/               ← CardForm, CardTable
│   │   ├── deck/               ← DeckCard, DeckForm
│   │   ├── folder/             ← FolderModal
│   │   ├── game/               ← GameElements
│   │   ├── gamification/       ← BadgeDisplay, StreakBanner, XPProgress
│   │   ├── stats/              ← StatsOverview
│   │   ├── study/              ← StudyCard, StudyProgress
│   │   ├── Chart.tsx
│   │   ├── TableStaticData.tsx
│   │   └── TinyEditor.tsx      ← Rich text editor tích hợp
│   ├── constants/
│   ├── data/
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── models/                 ← UmiJS models (state management)
│   │   ├── useAuthModel.ts
│   │   ├── useLayoutModel.ts
│   │   └── useLocaleModel.ts
│   ├── pages/
│   │   ├── index.tsx           ← Trang chủ
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── CreateDeckPage.tsx
│   │   ├── DeckDetailPage.tsx
│   │   ├── StudyPage.tsx
│   │   ├── StatisticsPage.tsx
│   │   ├── AchievementsPage.tsx
│   │   ├── ExpertSolutionsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── api.ts              ← Axios instance
│   │   ├── index.ts            ← Tất cả hàm gọi API (có caching)
│   │   └── typing.d.ts         ← TypeScript types/interfaces
│   ├── utils/
│   ├── routes.ts               ← Cấu hình route UmiJS
│   ├── app.tsx                 ← Runtime config UmiJS
│   └── global.css
├── package.json
└── .umirc.ts                   ← Cấu hình UmiJS
```

### 4.2. Backend

```
learning-dinosaur-backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma           ← Định nghĩa model database
│   └── seed.ts                 ← Script tạo dữ liệu mẫu
├── src/
│   ├── config/
│   │   └── prisma.ts           ← Prisma client singleton
│   ├── controllers/            ← Nhận request, gọi service, trả response
│   │   ├── authController.ts
│   │   ├── badgeController.ts
│   │   ├── cardController.ts
│   │   ├── deckController.ts
│   │   ├── searchController.ts
│   │   ├── statsController.ts
│   │   └── studyController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts   ← Xác thực JWT
│   │   └── errorMiddleware.ts
│   ├── repositories/           ← Tương tác trực tiếp với Prisma/database
│   │   ├── badgeRepository.ts
│   │   ├── cardRepository.ts
│   │   ├── deckRepository.ts
│   │   ├── studyLogRepository.ts
│   │   ├── tagRepository.ts
│   │   └── userRepository.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── badgeRoutes.ts
│   │   ├── cardRoutes.ts
│   │   ├── deckRoutes.ts
│   │   ├── searchRoutes.ts
│   │   ├── statsRoutes.ts
│   │   └── studyRoutes.ts
│   ├── services/               ← Business logic
│   │   ├── authService.ts
│   │   ├── badgeService.ts
│   │   ├── cardService.ts
│   │   ├── deckService.ts
│   │   ├── statsService.ts
│   │   └── studyService.ts
│   ├── utils/
│   │   └── jwt.ts
│   ├── validation/
│   │   └── schemas.ts          ← Zod validation schemas
│   ├── app.ts                  ← Express app setup
│   └── server.ts               ← Entry point, khởi động server
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 5. Cài đặt và chạy dự án

### 5.1. Yêu cầu môi trường

Cần cài sẵn:

- Node.js v16 trở lên
- npm
- MySQL Server 8.x
- MySQL Workbench (tuỳ chọn)
- Visual Studio Code

### 5.2. Tạo database MySQL

Mở MySQL Workbench và chạy:

```sql
CREATE DATABASE learning_dinosaur
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 5.3. Cài đặt backend

Mở terminal:

```bash
cd learning-dinosaur-backend
npm install
```

Tạo file `.env` trong thư mục backend (dựa theo `.env.example`):

```env
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/learning_dinosaur"
JWT_SECRET="learning_dinosaur_secret_key_2026"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:8000"
GOOGLE_CLIENT_ID="your_google_client_id_here"
```

> **Lưu ý:** Thay `YOUR_MYSQL_PASSWORD` bằng mật khẩu MySQL thật trên máy của bạn.

Đồng bộ schema database với Prisma:

```bash
npx prisma db push
```

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy backend:

```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

Kiểm tra backend bằng trình duyệt:

```
http://localhost:5000
```

Kết quả mong muốn:

```json
{ "message": "Learning Dinosaur API is running" }
```

### 5.4. Cài đặt frontend

Mở terminal khác:

```bash
cd learning-dinosaur
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:8000`

---

## 6. Seed dữ liệu demo

Dự án có file seed để tạo dữ liệu mẫu phục vụ demo.

Chạy trong thư mục backend:

```bash
cd learning-dinosaur-backend
npm run seed
```

Sau khi chạy thành công, hệ thống tạo tài khoản demo:

- **Email:** `demo@learningdinosaur.com`
- **Password:** `123456`

Dữ liệu demo gồm:

- 16 deck mẫu đa dạng:
  - TOEIC Vocabulary
  - JavaScript Interview Questions
  - React Hooks Mastery
  - Python Fundamentals
  - Data Structures & Algorithms
  - IELTS Speaking & Writing
  - Japanese N5 Vocabulary
  - World Geography Facts
  - Personal Finance & Investing
  - Physics — Mechanics & Thermodynamics
  - First Aid & Emergency Response
  - SQL & Database Fundamentals
  - Risk Management Basics
  - HTML5 & CSS3 Web Developer
  - Medical Terminology & Biology
  - Lịch sử Việt Nam hào hùng
- Flashcard đầy đủ cho từng deck.
- Một số thẻ đã thuộc, chưa thuộc, được gắn cờ cần xem lại.
- Study logs trong 7 ngày.
- XP, streak và badges mẫu.

> **Lưu ý:** Không cần chạy `npm run seed` mỗi lần chạy dự án. Chỉ chạy khi muốn tạo mới hoặc reset dữ liệu demo.

---

## 7. Cách chạy dự án hằng ngày

Mỗi lần mở dự án, chỉ cần chạy 2 terminal.

**Terminal 1 — Backend:**

```bash
cd learning-dinosaur-backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd learning-dinosaur
npm start
```

Sau đó mở: `http://localhost:8000`

---

## 8. API chính

### 8.1. Auth

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/me
```

### 8.2. Deck

```
GET    /api/decks
POST   /api/decks
GET    /api/decks/:deckId
PUT    /api/decks/:deckId
DELETE /api/decks/:deckId
GET    /api/decks/tags/all
```

### 8.3. Card

```
GET    /api/cards
PUT    /api/cards/:cardId
DELETE /api/cards/:cardId
PATCH  /api/cards/:cardId/review-flag
GET    /api/decks/:deckId/cards
POST   /api/decks/:deckId/cards
```

### 8.4. Study

```
GET  /api/study/decks/:deckId/session
GET  /api/study/decks/:deckId/session?reviewOnly=true
POST /api/study/cards/:cardId/review
```

### 8.5. Statistics

```
GET /api/stats/overview
GET /api/stats/weekly
```

### 8.6. Search

```
GET /api/search?q=keyword
```

### 8.7. Badges

```
GET /api/badges
```

---

## 9. Luồng demo đề xuất

Khi thuyết trình, có thể demo theo thứ tự:

1. Đăng nhập bằng tài khoản demo.
2. Xem trang chủ: Streak Banner, danh sách deck, lọc theo tag.
3. Sử dụng Global Search (icon kính lúp) để tìm deck/card.
4. Nhấn "Học" trực tiếp từ trang chủ — phiên học tự động bắt đầu.
5. Lật thẻ, chọn Đã thuộc / Chưa thuộc, gắn cờ Cần xem lại.
6. Xem màn hình kết thúc phiên học, gợi ý deck tiếp theo.
7. Vào deck chi tiết, tạo thẻ mới bằng rich text editor, tải ảnh lên thẻ.
8. Tạo deck mới với giao diện kiểu Dinosaur.
9. Xem trang Thống kê và biểu đồ 7 ngày.
10. Xem trang Thành tựu.
11. Mở MySQL Workbench để chứng minh dữ liệu lưu thật trong database.

---

## 10. Kiểm thử chức năng

Checklist kiểm thử:

- [ ] Đăng ký được tài khoản mới.
- [ ] Đăng nhập được bằng email/password.
- [ ] Đăng nhập được bằng Google OAuth.
- [ ] Đăng xuất được.
- [ ] Tạo deck được.
- [ ] Sửa deck được.
- [ ] Xóa deck được.
- [ ] Tạo nhiều card cùng lúc trong CreateDeckPage.
- [ ] Thêm card trong DeckDetailPage.
- [ ] Sửa card với rich text editor.
- [ ] Xóa card được.
- [ ] Tải ảnh lên thẻ được.
- [ ] Gắn cờ cần xem lại được.
- [ ] Nhấn "Học" từ trang chủ tự động bắt đầu phiên.
- [ ] Shuffle hoạt động.
- [ ] Chỉ học thẻ cần xem lại hoạt động.
- [ ] Thẻ Chưa thuộc quay lại cuối phiên.
- [ ] XP tăng sau khi học.
- [ ] Streak cập nhật sau khi học.
- [ ] Header hiển thị Streak và XP realtime.
- [ ] Statistics cập nhật.
- [ ] Badges tự động mở khóa.
- [ ] Global Search tìm được deck và card.
- [ ] Sidebar trên mobile mở/đóng đúng, không bóp nội dung trang.
- [ ] Trang học thẻ mobile hiển thị thanh tiến trình dọc và nút cố định dưới đáy.
- [ ] Refresh trình duyệt không mất dữ liệu.

---

## 11. Bảo mật

Dự án đã áp dụng các cơ chế bảo mật cơ bản:

- Mật khẩu được mã hóa bằng bcrypt.
- API xác thực bằng JWT.
- Validation dữ liệu đầu vào bằng Zod.
- Các route quản lý deck, card, study, stats, search và badges yêu cầu token.
- Dữ liệu được phân tách theo user.
- User chỉ xem và thao tác được dữ liệu của chính mình.

---

**Dự án:** Learning Dinosaur  
**Mục đích:** Bài thực hành / đồ án xây dựng web app Flashcard  
**Công nghệ chính:** React, UmiJS, TypeScript, Node.js, Express, Prisma, MySQL
