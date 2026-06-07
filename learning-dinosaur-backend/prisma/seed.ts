import { PrismaClient, CardStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@learningdinosaur.com';
const DEMO_PASSWORD = '123456';

function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function createTags(userId: string, tagNames: string[]) {
  const tags: any[] = [];

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      update: {},
      create: {
        userId,
        name,
      },
    });

    tags.push(tag);
  }

  return tags;
}

async function connectDeckTags(deckId: string, tags: any[]) {
  for (const tag of tags) {
    await prisma.deckTag.upsert({
      where: {
        deckId_tagId: {
          deckId,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        deckId,
        tagId: tag.id,
      },
    });
  }
}

async function createDeckWithCards(userId: string, deckData: any) {
  const tags = await createTags(userId, deckData.tags);

  const deck = await prisma.deck.create({
    data: {
      userId,
      name: deckData.name,
      description: deckData.description,
    },
  });

  await connectDeckTags(deck.id, tags);

  const createdCards: any[] = [];

  for (const card of deckData.cards) {
    const createdCard = await prisma.card.create({
      data: {
        deckId: deck.id,
        front: card.front,
        back: card.back,
        status: (card.status as CardStatus) || 'NEW',
        reviewFlag: card.reviewFlag || false,
        lastReviewed: card.lastReviewed || null,
        reviewCount: card.reviewCount || 0,
      },
    });

    createdCards.push(createdCard);
  }

  return {
    deck,
    cards: createdCards,
  };
}

async function createStudyLogs(userId: string, createdDecks: any[]) {
  const allCards = createdDecks.flatMap((item) =>
    item.cards.map((card: any) => ({
      ...card,
      deckId: item.deck.id,
    }))
  );

  const logsToCreate = [
    { daysAgo: 6, count: 2 },
    { daysAgo: 5, count: 3 },
    { daysAgo: 4, count: 1 },
    { daysAgo: 3, count: 4 },
    { daysAgo: 2, count: 2 },
    { daysAgo: 1, count: 3 },
    { daysAgo: 0, count: 5 },
  ];

  let cardIndex = 0;

  for (const logGroup of logsToCreate) {
    for (let i = 0; i < logGroup.count; i += 1) {
      const card = allCards[cardIndex % allCards.length];
      const result = i % 3 === 0 ? 'NOT_MASTERED' : 'MASTERED';
      const xpEarned = result === 'MASTERED' ? 10 : 2;

      await prisma.studyLog.create({
        data: {
          userId,
          deckId: card.deckId,
          cardId: card.id,
          result,
          xpEarned,
          studiedAt: getDateDaysAgo(logGroup.daysAgo),
        },
      });

      cardIndex += 1;
    }
  }
}

async function createBadges() {
  const badges = [
    {
      code: 'FIRST_STEP',
      name: 'First Step',
      description: 'Học thẻ đầu tiên',
    },
    {
      code: 'STREAK_7',
      name: '7-Day Streak',
      description: 'Học liên tục 7 ngày',
    },
    {
      code: 'STUDY_100',
      name: '100 Cards',
      description: 'Học đủ 100 lượt thẻ',
    },
    {
      code: 'DECK_FINISHER',
      name: 'Deck Finisher',
      description: 'Hoàn thành toàn bộ một deck',
    },
    {
      code: 'DINOSAUR_LEGEND',
      name: 'Dinosaur Legend',
      description: 'Đạt cấp Khủng Long Bất Tử',
    },
  ];

  const createdBadges: any[] = [];

  for (const badge of badges) {
    const createdBadge = await prisma.badge.upsert({
      where: {
        code: badge.code,
      },
      update: {
        name: badge.name,
        description: badge.description,
      },
      create: badge,
    });

    createdBadges.push(createdBadge);
  }

  return createdBadges;
}

async function unlockDemoBadges(userId: string, badges: any[]) {
  const unlockedCodes = ['FIRST_STEP', 'DECK_FINISHER'];

  for (const badge of badges) {
    if (!unlockedCodes.includes(badge.code)) continue;

    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
      update: {},
      create: {
        userId,
        badgeId: badge.id,
        unlockedAt: new Date(),
      },
    });
  }
}

async function main() {
  console.log('Deleting old demo user data...');

  const oldDemoUser = await prisma.user.findUnique({
    where: {
      email: DEMO_EMAIL,
    },
  });

  if (oldDemoUser) {
    await prisma.user.delete({
      where: {
        id: oldDemoUser.id,
      },
    });
  }

  console.log('Creating demo user...');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      displayName: 'Demo Dinosaur',
      xp: 420,
      currentStreak: 5,
      lastStudyDate: new Date(),
    },
  });

  const deckTemplates = [
    {
      name: 'TOEIC Vocabulary',
      description: 'Từ vựng TOEIC thường gặp trong công việc và kinh doanh.',
      tags: ['toeic', 'tieng-anh', 'vocabulary'],
      cards: [
        { front: 'revenue', back: 'doanh thu', status: 'MASTERED', reviewCount: 3, lastReviewed: getDateDaysAgo(1) },
        { front: 'expense', back: 'chi phí', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
        { front: 'profit', back: 'lợi nhuận', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(2) },
        { front: 'invoice', back: 'hóa đơn', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(2) },
        { front: 'shipment', back: 'lô hàng / việc vận chuyển', status: 'NEW' },
        { front: 'deadline', back: 'hạn chót', status: 'NEW' },
        { front: 'supplier', back: 'nhà cung cấp', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(3) },
        { front: 'customer satisfaction', back: 'sự hài lòng của khách hàng', status: 'NEW' },
        { front: 'contract', back: 'hợp đồng', status: 'MASTERED', reviewCount: 4, lastReviewed: getDateDaysAgo(4) },
        { front: 'delivery fee', back: 'phí giao hàng', status: 'NEW' },
        { front: 'merchandise', back: 'hàng hóa thương mại', status: 'NEW' },
        { front: 'negotiation', back: 'sự đàm phán, thương lượng', status: 'MASTERED', reviewCount: 3, lastReviewed: getDateDaysAgo(3) },
        { front: 'agenda', back: 'chương trình nghị sự, nội dung cuộc họp', status: 'NEW' },
        { front: 'reimbursement', back: 'sự hoàn tiền, bồi hoàn chi phí', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 2, lastReviewed: getDateDaysAgo(2) },
        { front: 'subsidiary', back: 'công ty con', status: 'NEW' },
        { front: 'headquarters', back: 'trụ sở chính', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
        { front: 'inventory', back: 'hàng tồn kho / sự kiểm kê hàng hóa', status: 'NEW' },
        { front: 'liability', back: 'trách nhiệm pháp lý / khoản nợ phải trả', status: 'NEW' },
        { front: 'marketing campaign', back: 'chiến dịch tiếp thị', status: 'MASTERED', reviewCount: 5, lastReviewed: getDateDaysAgo(2) },
        { front: 'vacancy', back: 'vị trí công việc còn trống', status: 'NEW' },
        { front: 'personnel department', back: 'phòng nhân sự', status: 'NEW' },
        { front: 'appraisal', back: 'sự đánh giá, định giá năng lực', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(4) },
        { front: 'monopoly', back: 'sự độc quyền thị trường', status: 'NEW' },
        { front: 'merge', back: 'sáp nhập doanh nghiệp', status: 'NEW' },
        { front: 'broker', back: 'người môi giới, đại lý trung gian', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(5) },
      ],
    },
    {
      name: 'Risk Management Basics',
      description: 'Khái niệm cơ bản về quản trị rủi ro, kiểm soát và chỉ số cảnh báo.',
      tags: ['risk', 'business', 'internal-control'],
      cards: [
        { front: 'Risk', back: 'Sự không chắc chắn có thể ảnh hưởng đến mục tiêu.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
        { front: 'Risk Event', back: 'Sự kiện cụ thể làm rủi ro phát sinh.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
        { front: 'Root Cause', back: 'Nguyên nhân gốc rễ dẫn đến rủi ro.', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(2) },
        { front: 'Impact', back: 'Hậu quả nếu rủi ro xảy ra.', status: 'NEW' },
        { front: 'Key Risk Indicator', back: 'Chỉ số cảnh báo sớm về mức độ rủi ro.', status: 'NEW' },
        { front: 'Control', back: 'Biện pháp giúp phòng ngừa, phát hiện hoặc khắc phục rủi ro.', status: 'MASTERED', reviewCount: 3, lastReviewed: getDateDaysAgo(3) },
        { front: 'Residual Risk', back: 'Rủi ro còn lại sau khi đã áp dụng kiểm soát.', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(4) },
        { front: 'Risk Appetite', back: 'Mức độ rủi ro tổ chức sẵn sàng chấp nhận.', status: 'NEW' },
        { front: 'Risk Register', back: 'Sổ tay đăng ký ghi nhận tất cả rủi ro được nhận diện.', status: 'NEW' },
        { front: 'Mitigation Plan', back: 'Kế hoạch giảm thiểu tác động hoặc khả năng xảy ra của rủi ro.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
      ],
    },
    {
      name: 'JavaScript Interview',
      description: 'Các câu hỏi JavaScript thường gặp khi phỏng vấn frontend developer.',
      tags: ['javascript', 'programming', 'interview'],
      cards: [
        { front: 'What is closure?', back: 'Closure là khả năng function ghi nhớ scope nơi nó được tạo ra.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(1) },
        { front: 'What is hoisting?', back: 'Hoisting là cơ chế đưa khai báo biến/hàm lên đầu scope trong quá trình compile.', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(2) },
        { front: 'Difference between let and var?', back: 'let có block scope, var có function scope.', status: 'NEW' },
        { front: 'What is Promise?', back: 'Promise đại diện cho kết quả bất đồng bộ trong tương lai.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(3) },
        { front: 'What is async/await?', back: 'Cú pháp giúp viết code bất đồng bộ giống như code đồng bộ.', status: 'NEW' },
        { front: 'What is event loop?', back: 'Cơ chế xử lý call stack, callback queue và microtask queue.', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(3) },
        { front: 'What is React state?', back: 'State là dữ liệu nội bộ của component, khi thay đổi sẽ trigger render.', status: 'NEW' },
        { front: 'What is useEffect?', back: 'Hook dùng để xử lý side effects như gọi API, subscribe hoặc cập nhật DOM.', status: 'NEW' },
        { front: 'What is currying?', back: 'Kỹ thuật chuyển đổi một hàm nhận nhiều tham số thành một chuỗi các hàm nhận 1 tham số.', status: 'NEW' },
        { front: 'What is Event Delegation?', back: 'Gắn sự kiện vào node cha thay vì tất cả các node con để tối ưu bộ nhớ.', status: 'MASTERED', reviewCount: 3, lastReviewed: getDateDaysAgo(2) },
        { front: 'What is Virtual DOM?', back: 'Bản sao nhẹ bằng JS của DOM thực tế, giúp React so sánh khác biệt và update tối ưu.', status: 'NEW' },
        { front: 'Difference between double equals (==) and triple equals (===)?', back: '== so sánh giá trị sau khi ép kiểu, === so sánh cả giá trị và kiểu dữ liệu (nghiêm ngặt).', status: 'MASTERED', reviewCount: 4, lastReviewed: getDateDaysAgo(1) },
        { front: 'What is Debouncing?', back: 'Kỹ thuật trì hoãn thực thi một hàm cho đến khi không có sự kiện nào kích hoạt sau thời gian nhất định.', status: 'NEW' },
        { front: 'What is Throttling?', back: 'Kỹ thuật giới hạn số lần gọi một hàm trong một khoảng thời gian nhất định.', status: 'NEW' },
        { front: 'Difference between Null and Undefined?', back: 'Undefined là biến chưa được gán giá trị, Null là gán giá trị rỗng được lập trình viên chỉ định rõ ràng.', status: 'NOT_MASTERED', reviewFlag: true, reviewCount: 1, lastReviewed: getDateDaysAgo(4) },
        { front: 'What is prototype?', back: 'Cơ chế kế thừa thuộc tính và phương thức giữa các object trong JS.', status: 'NEW' },
        { front: 'What is strict mode?', back: 'Chế độ nghiêm ngặt giúp bắt các lỗi ẩn, ngăn khai báo biến toàn cục bừa bãi.', status: 'NEW' },
        { front: 'What is IIFE?', back: 'Immediately Invoked Function Expression - Hàm khởi tạo và chạy ngay lập tức.', status: 'MASTERED', reviewCount: 2, lastReviewed: getDateDaysAgo(3) },
        { front: 'Difference between map and forEach?', back: 'map trả về mảng mới, forEach chỉ duyệt mảng mà không trả về kết quả.', status: 'NEW' },
        { front: 'What is destructuring?', back: 'Cú pháp giải nén giá trị từ mảng hoặc thuộc tính của object thành các biến độc lập.', status: 'NEW' },
      ],
    },
    {
      name: 'HTML5 & CSS3 Web Developer',
      description: 'Lý thuyết cốt lõi về layout, căn chỉnh flexbox, CSS Grid và responsive web.',
      tags: ['html', 'css', 'frontend', 'layout'],
      cards: [
        { front: 'Semantic HTML', back: 'Các thẻ HTML mang ý nghĩa cấu trúc (header, footer, article, section...) giúp SEO và tối ưu trình đọc màn hình.', status: 'NEW' },
        { front: 'flex-direction', back: 'Thuộc tính CSS xác định trục chính sắp xếp phần tử con trong Flexbox (row, row-reverse, column, column-reverse).', status: 'NEW' },
        { front: 'justify-content', back: 'Căn chỉnh phần tử con dọc theo trục chính (main axis) của Flex Container.', status: 'NEW' },
        { front: 'align-items', back: 'Căn chỉnh phần tử con dọc theo trục phụ (cross axis) của Flex Container.', status: 'NEW' },
        { front: 'CSS Grid', back: 'Hệ thống bố cục 2 chiều (dòng và cột) mạnh mẽ nhất trong CSS.', status: 'NEW' },
        { front: 'media queries', back: 'Cú pháp CSS áp dụng các thuộc tính style khác nhau dựa trên kích thước màn hình thiết bị.', status: 'NEW' },
        { front: 'z-index', back: 'Xác định thứ tự xếp chồng các phần tử trên trục Z (phần tử z-index lớn hơn nằm đè lên trên).', status: 'NEW' },
        { front: 'CSS Variables', back: 'Khai báo biến lưu trữ giá trị CSS sử dụng cú pháp --variable-name và truy xuất bằng var().', status: 'NEW' },
        { front: 'box-sizing: border-box', back: 'Cách tính kích thước phần tử bao gồm cả padding và border giúp kiểm soát layout dễ hơn.', status: 'NEW' },
        { front: 'position: absolute', back: 'Định vị phần tử dựa trên phần tử cha gần nhất có position khác static.', status: 'NEW' },
        { front: 'position: sticky', back: 'Cuộn theo trang như relative cho tới khi gặp tọa độ quy định sẽ neo cố định như fixed.', status: 'NEW' },
        { front: 'transition', back: 'Tạo hiệu ứng chuyển đổi mượt mà giữa các trạng thái CSS khác nhau.', status: 'NEW' },
        { front: 'keyframes', back: 'Quy định các mốc chuyển động trong CSS Animation từ lúc bắt đầu (0%) đến kết thúc (100%).', status: 'NEW' },
        { front: 'rem vs em', back: 'rem tính kích thước dựa trên font-size của root html, em tính kích thước dựa trên font-size của chính cha nó.', status: 'NEW' },
        { front: 'viewport units', back: 'Các đơn vị kích thước tương đối dựa trên chiều rộng (vw) và chiều cao (vh) của màn hình thiết bị.', status: 'NEW' },
      ],
    },
    {
      name: 'Medical Terminology & Biology',
      description: 'Cấu tạo sinh học tế bào, các cơ quan cơ thể và thuật ngữ y học phổ thông.',
      tags: ['biology', 'science', 'medical'],
      cards: [
        { front: 'Mitochondria', back: 'Ty thể - nhà máy năng lượng của tế bào, nơi diễn ra hô hấp tế bào tạo ra ATP.', status: 'NEW' },
        { front: 'DNA', back: 'Axit Deoxyribonucleic - phân tử mang thông tin di truyền mã hóa sự phát triển của sinh vật.', status: 'NEW' },
        { front: 'Ribosome', back: 'Bào quan thực hiện chức năng tổng hợp protein dựa trên thông tin di truyền.', status: 'NEW' },
        { front: 'Photosynthesis', back: 'Quang hợp - quá trình thực vật biến đổi ánh sáng, CO2 và nước thành glucose và O2.', status: 'NEW' },
        { front: 'Hemoglobin', back: 'Huyết sắc tố trong hồng cầu giúp vận chuyển khí oxy từ phổi đi khắp cơ thể.', status: 'NEW' },
        { front: 'Homeostasis', back: 'Sự cân bằng nội môi - duy trì môi trường sống nội bộ ổn định trong cơ thể sống.', status: 'NEW' },
        { front: 'Mitosis', back: 'Nguyên phân - quá trình phân chia tế bào sinh dưỡng tạo ra 2 tế bào con giống hệt tế bào mẹ.', status: 'NEW' },
        { front: 'Meiosis', back: 'Giảm phân - quá trình phân chia tế bào sinh dục tạo ra 4 giao tử có số nhiễm sắc thể giảm một nửa.', status: 'NEW' },
        { front: 'Enzyme', back: 'Chất xúc tác sinh học cấu tạo từ protein giúp đẩy nhanh tốc độ phản ứng hóa sinh trong cơ thể.', status: 'NEW' },
        { front: 'Capillaries', back: 'Mao mạch - hệ thống mạch máu siêu nhỏ kết nối tiểu động mạch và tiểu tĩnh mạch, nơi trao đổi chất.', status: 'NEW' },
        { front: 'Neuron', back: 'Tế bào thần kinh truyền dẫn thông tin thông qua các tín hiệu điện học và hóa học.', status: 'NEW' },
        { front: 'Pathogen', back: 'Tác nhân gây bệnh (vi khuẩn, virus, nấm, ký sinh trùng) xâm nhập vào cơ thể vật chủ.', status: 'NEW' },
        { front: 'Antibody', back: 'Kháng thể do hệ miễn dịch tạo ra để nhận biết và vô hiệu hóa các kháng nguyên lạ.', status: 'NEW' },
        { front: 'Gene', back: 'Đoạn DNA mang thông tin mã hóa cấu trúc một chuỗi polypeptide hoặc phân tử RNA.', status: 'NEW' },
        { front: 'Hormone', back: 'Chất hóa học do các tuyến nội tiết tiết ra giúp điều hòa hoạt động của cơ quan xa.', status: 'NEW' },
      ],
    },
    {
      name: 'Lịch sử Việt Nam hào hùng',
      description: 'Tổng hợp các cột mốc lịch sử hào hùng, các trận chiến hiển hách của dân tộc Việt Nam.',
      tags: ['history', 'viet-nam', 'social-science'],
      cards: [
        { front: 'Năm 938', back: 'Ngô Quyền đánh bại quân Nam Hán trên sông Bạch Đằng bằng bãi cọc nhọn, mở ra kỷ nguyên độc lập lâu dài.', status: 'NEW' },
        { front: 'Lý Thường Kiệt', back: 'Tướng quân nhà Lý, tác giả bài thơ thần "Nam quốc sơn hà" vang danh phòng tuyến sông Như Nguyệt.', status: 'NEW' },
        { front: 'Hội nghị Diên Hồng', back: 'Hội nghị dân chủ đầu tiên dưới triều Trần năm 1284 trưng cầu ý dân đoàn kết đánh giặc Nguyên Mông.', status: 'NEW' },
        { front: 'Chiến thắng Chi Lăng', back: 'Năm 1427, nghĩa quân Lam Sơn chém đầu Liễu Thăng tại ải Chi Lăng buộc quân Minh phải rút về nước.', status: 'NEW' },
        { front: 'Quang Trung - Nguyễn Huệ', back: 'Hoàng đế triều Tây Sơn lãnh đạo cuộc hành quân thần tốc đánh bại 29 vạn quân Thanh dịp Tết Kỷ Dậu 1789.', status: 'NEW' },
        { front: 'Ngày 2/9/1945', back: 'Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại quảng trường Ba Đình khai sinh nước Việt Nam Dân chủ Cộng hòa.', status: 'NEW' },
        { front: 'Chiến dịch Điện Biên Phủ', back: 'Năm 1954, Việt Minh lừng lẫy năm châu chấn động địa cầu đánh bại tập đoàn cứ điểm Pháp buộc ký Hiệp định Giơ-ne-vơ.', status: 'NEW' },
        { front: 'Ngày 30/4/1975', back: 'Chiến dịch Hồ Chí Minh toàn thắng, giải phóng hoàn toàn miền Nam, thống nhất đất nước.', status: 'NEW' },
        { front: 'Trần Hưng Đạo', back: 'Hưng Đạo Đại Vương, vị quốc công tiết chế lãnh đạo nhân dân đánh thắng giặc Nguyên Mông 3 lần, tác giả "Hịch tướng sĩ".', status: 'NEW' },
        { front: 'Bình Ngô Đại Cáo', back: 'Tác phẩm của Nguyễn Trãi năm 1428 được coi là bản Tuyên ngôn Độc lập thứ hai của dân tộc sau khi thắng giặc Minh.', status: 'NEW' },
        { front: 'Trưng Vương', back: 'Hai Bà Trưng (Trưng Trắc và Trưng Nhị) phất cờ khởi nghĩa năm 40 chống lại ách đô hộ của nhà Đông Hán.', status: 'NEW' },
        { front: 'Chiến dịch Điện Biên Phủ trên không', back: '12 ngày đêm cuối năm 1972 đánh bại cuộc tập kích chiến lược B-52 của Mỹ vào Hà Nội và Hải Phòng.', status: 'NEW' },
        { front: 'Hội thề Lũng Nhai', back: 'Nguyễn Huệ và 18 chiến hữu thành lập nghĩa quân Lam Sơn năm 1416 đồng lòng đánh giặc cứu nước.', status: 'NEW' },
        { front: 'Phong trào Cần Vương', back: 'Phong trào phò vua Hàm Nghi kháng Pháp cuối thế kỷ XIX lãnh đạo bởi các văn thân sĩ phu yêu nước.', status: 'NEW' },
        { front: 'Chiến dịch Biên giới 1950', back: 'Chiến dịch phản công lớn đầu tiên giúp khai thông biên giới Việt - Trung để nhận viện trợ quốc tế.', status: 'NEW' },
      ],
    },
    {
      name: 'Python Programming Essentials',
      description: 'Cú pháp cơ bản, cấu trúc dữ liệu và các khái niệm cốt lõi trong ngôn ngữ Python.',
      tags: ['python', 'programming', 'basics'],
      cards: [
        { front: 'List Comprehensions', back: 'Cú pháp ngắn gọn để tạo mảng/list mới từ list đã có: [x for x in list].', status: 'NEW' },
        { front: 'Dictionary', back: 'Cấu trúc dữ liệu lưu trữ dưới dạng key-value cặp khóa-giá trị.', status: 'NEW' },
        { front: 'PEP 8', back: 'Tài liệu hướng dẫn phong cách code (style guide) chuẩn cho Python.', status: 'NEW' },
        { front: 'Decorator', back: 'Hàm nhận một hàm khác làm tham số và thay đổi hành vi của nó mà không sửa code gốc.', status: 'NEW' },
        { front: 'Generator', back: 'Hàm trả về một iterator sử dụng từ khóa yield để tạo ra chuỗi giá trị lười (lazy).', status: 'NEW' },
        { front: 'Virtualenv', back: 'Công cụ tạo môi trường ảo độc lập cho các dự án Python khác nhau.', status: 'NEW' },
        { front: 'f-strings', back: 'Cú pháp định dạng chuỗi nhanh và trực quan bắt đầu bằng f"..." trong Python 3.6+.', status: 'NEW' },
        { front: 'pass statement', back: 'Lệnh giữ chỗ rỗng (placeholder) không thực thi hành động nào.', status: 'NEW' },
      ],
    },
    {
      name: 'React Hooks & Patterns',
      description: 'Lý thuyết các React hooks phổ biến và quy trình vòng đời component.',
      tags: ['react', 'frontend', 'hooks'],
      cards: [
        { front: 'useState', back: 'Hook khai báo state nội bộ lưu trữ trạng thái của Functional Component.', status: 'NEW' },
        { front: 'useEffect', back: 'Hook quản lý các tác vụ phụ (side effects) như gọi API, đăng ký sự kiện.', status: 'NEW' },
        { front: 'useContext', back: 'Hook đọc dữ liệu trực tiếp từ React Context mà không cần prop-drilling.', status: 'NEW' },
        { front: 'useMemo', back: 'Tránh tính toán lại các biểu thức nặng bằng cách cache lại kết quả tính toán.', status: 'NEW' },
        { front: 'useCallback', back: 'Cache lại định nghĩa của hàm để tránh khởi tạo lại hàm ở mỗi lượt render.', status: 'NEW' },
        { front: 'useRef', back: 'Lưu trữ giá trị khả biến không gây re-render khi thay đổi, hoặc tham chiếu đến phần tử DOM thực.', status: 'NEW' },
        { front: 'Custom Hook', back: 'Hàm JS tự tạo bắt đầu bằng "use" giúp tái sử dụng logic chứa các hook khác.', status: 'NEW' },
        { front: 'React.memo', back: 'Hàm bậc cao (HOC) ngăn Functional Component re-render nếu props truyền vào không đổi.', status: 'NEW' },
      ],
    },
    {
      name: 'Algorithms & Data Structures',
      description: 'Các cấu trúc dữ liệu cơ bản và thuật toán tìm kiếm, sắp xếp kinh diễn.',
      tags: ['computer-science', 'algorithms', 'structures'],
      cards: [
        { front: 'Linked List', back: 'Danh sách liên kết - tập hợp các node chứa dữ liệu và con trỏ liên kết đến node tiếp theo.', status: 'NEW' },
        { front: 'Stack', back: 'Ngăn xếp - cấu trúc dữ liệu hoạt động theo nguyên lý vào sau ra trước (LIFO - Last In First Out).', status: 'NEW' },
        { front: 'Queue', back: 'Hàng đợi - cấu trúc dữ liệu hoạt động theo nguyên lý vào trước ra trước (FIFO - First In First Out).', status: 'NEW' },
        { front: 'Binary Search', back: 'Tìm kiếm nhị phân - thuật toán tìm kiếm trên mảng đã sắp xếp với độ phức tạp O(log n).', status: 'NEW' },
        { front: 'Quicksort', back: 'Sắp xếp nhanh - thuật toán chia để trị chọn phần tử chốt (pivot) để phân vùng mảng.', status: 'NEW' },
        { front: 'Hash Table', back: 'Bảng băm - ánh xạ khóa sang giá trị bằng hàm băm giúp tìm kiếm có độ phức tạp trung bình O(1).', status: 'NEW' },
        { front: 'Recursion', back: 'Đệ quy - hàm tự gọi lại chính nó với bài toán có quy mô nhỏ hơn cho đến khi gặp điều kiện dừng.', status: 'NEW' },
      ],
    },
    {
      name: 'General IELTS Vocabulary',
      description: 'Từ vựng học thuật IELTS cao cấp giúp nâng cao điểm viết và đọc.',
      tags: ['ielts', 'english', 'vocabulary'],
      cards: [
        { front: 'beneficial', back: 'có lợi, mang lại kết quả tốt', status: 'NEW' },
        { front: 'detrimental', back: 'có hại, gây bất lợi', status: 'NEW' },
        { front: 'mitigate', back: 'làm dịu đi, giảm nhẹ tác động tiêu cực', status: 'NEW' },
        { front: 'obsolete', back: 'lỗi thời, không còn được sử dụng', status: 'NEW' },
        { front: 'fluctuate', back: 'dao động, biến động liên tục', status: 'NEW' },
        { front: 'advocate', back: 'ủng hộ, tán thành công khai', status: 'NEW' },
        { front: 'arbitrary', back: 'tùy ý, độc đoán, không dựa trên quy luật nào', status: 'NEW' },
        { front: 'pinnacle', back: 'đỉnh cao, điểm cực thịnh', status: 'NEW' },
      ],
    },
    {
      name: 'Basic Japanese Phrases (N5)',
      description: 'Mẫu câu và từ vựng tiếng Nhật sơ cấp dành cho người mới bắt đầu.',
      tags: ['japanese', 'languages', 'n5'],
      cards: [
        { front: 'こんにちは (Konnichiwa)', back: 'Xin chào (dùng vào ban ngày).', status: 'NEW' },
        { front: 'ありがとう (Arigatou)', back: 'Cám ơn.', status: 'NEW' },
        { front: 'すみません (Sumimasen)', back: 'Xin lỗi / Cho tôi hỏi.', status: 'NEW' },
        { front: 'わかりません (Wakarimasen)', back: 'Tôi không hiểu.', status: 'NEW' },
        { front: 'いくらですか (Ikura desu ka)', back: 'Cái này bao nhiêu tiền?', status: 'NEW' },
        { front: 'doko desu ka', back: 'Ở đâu vậy?', status: 'NEW' },
        { front: 'はじめまして (Hajimemashite)', back: 'Rất hân hạnh được gặp bạn (lần đầu).', status: 'NEW' },
      ],
    },
    {
      name: 'World Geography Trivia',
      description: 'Kiến thức địa lý thế giới về các châu lục, quốc gia và kỳ quan thiên nhiên.',
      tags: ['geography', 'trivia', 'science'],
      cards: [
        { front: 'Sông Amazon', back: 'Sông có lưu lượng nước lớn nhất thế giới, nằm ở Nam Mỹ.', status: 'NEW' },
        { front: 'Sông Nile', back: 'Sông dài nhất thế giới, chảy qua nhiều nước Đông Phi.', status: 'NEW' },
        { front: 'Sa mạc Sahara', back: 'Sa mạc nóng lớn nhất thế giới, bao phủ phần lớn Bắc Phi.', status: 'NEW' },
        { front: 'Đỉnh Everest', back: 'Đỉnh núi cao nhất thế giới thuộc dãy Himalaya.', status: 'NEW' },
        { front: 'Thái Bình Dương', back: 'Đại dương lớn nhất và sâu nhất trên Trái Đất.', status: 'NEW' },
        { front: 'Canberra', back: 'Thủ đô chính thức của nước Úc (Australia).', status: 'NEW' },
        { front: 'Moscow', back: 'Thủ đô và thành phố lớn nhất của nước Nga.', status: 'NEW' },
      ],
    },
    {
      name: 'Basic Financial Literacy',
      description: 'Các thuật ngữ tài chính cơ bản để quản lý tiền tệ cá nhân hiệu quả.',
      tags: ['finance', 'money', 'basics'],
      cards: [
        { front: 'Asset', back: 'Tài sản - những thứ bạn sở hữu và mang lại giá trị kinh tế/tiền bạc.', status: 'NEW' },
        { front: 'Liability', back: 'Tiêu sản / Khoản nợ - những thứ khiến bạn phải tiêu tiền ra khỏi túi.', status: 'NEW' },
        { front: 'Inflation', back: 'Lạm phát - sự mất giá của tiền tệ theo thời gian.', status: 'NEW' },
        { front: 'Compound Interest', back: 'Lãi kép - tiền lãi phát sinh được cộng dồn vào vốn để tính lãi tiếp.', status: 'NEW' },
        { front: 'Stock', back: 'Cổ phiếu - chứng chỉ xác nhận quyền sở hữu một phần doanh nghiệp.', status: 'NEW' },
        { front: 'Bond', back: 'Trái phiếu - chứng chỉ vay nợ chứng nhận nghĩa vụ trả nợ.', status: 'NEW' },
        { front: 'Net Worth', back: 'Giá trị tài sản ròng - tài sản trừ đi các khoản nợ.', status: 'NEW' },
      ],
    },
    {
      name: 'Physics Formulas & Constants',
      description: 'Tổng hợp các công thức vật lý phổ thông và hằng số vũ trụ cơ bản.',
      tags: ['physics', 'science', 'formulas'],
      cards: [
        { front: 'Định luật II Newton', back: 'Gia tốc tỉ lệ thuận với lực tác dụng: F = m * a.', status: 'NEW' },
        { front: 'Vận tốc ánh sáng (c)', back: 'Vận tốc ánh sáng trong chân không: c = 3 * 10^8 m/s.', status: 'NEW' },
        { front: 'Hằng số hấp dẫn (G)', back: 'Hằng số vạn vật hấp dẫn: G = 6.67 * 10^-11 N.m2/kg2.', status: 'NEW' },
        { front: 'Định luật Ohm', back: 'Cường độ dòng điện trong mạch: I = U / R.', status: 'NEW' },
        { front: 'Thuyết tương đối', back: 'Năng lượng tương đương khối lượng: E = mc^2.', status: 'NEW' },
        { front: 'Khối lượng riêng', back: 'Mật độ khối lượng vật chất: D = m / V.', status: 'NEW' },
      ],
    },
    {
      name: 'Basic First Aid & Safety',
      description: 'Kỹ năng sơ cứu vết thương, xử lý tai nạn và an toàn y tế cơ bản.',
      tags: ['first-aid', 'safety', 'health'],
      cards: [
        { front: 'CPR', back: 'Hồi sức tim phổi - kết hợp ấn ngực và hà hơi thổi ngạt.', status: 'NEW' },
        { front: 'Sơ cứu bỏng', back: 'Ngâm vùng bỏng nhẹ vào nước mát sạch trong 15-20 phút.', status: 'NEW' },
        { front: 'Nghẹt thở (Heimlich)', back: 'Thủ thuật đẩy mạnh cơ hoành từ phía sau để tống dị vật ra.', status: 'NEW' },
        { front: 'Quy tắc R.I.C.E', back: 'Nghỉ ngơi (Rest), Chườm đá (Ice), Băng ép (Compress), Nâng cao (Elevate).', status: 'NEW' },
        { front: 'Sơ cứu chảy máu', back: 'Dùng gạc sạch ấn trực tiếp lên vết thương để cầm máu.', status: 'NEW' },
      ],
    },
    {
      name: 'SQL & Database Basics',
      description: 'Cú pháp truy vấn cơ bản và các khái niệm thiết kế cơ sở dữ liệu.',
      tags: ['sql', 'database', 'query'],
      cards: [
        { front: 'SELECT', back: 'Lấy dữ liệu từ một hoặc nhiều bảng trong cơ sở dữ liệu.', status: 'NEW' },
        { front: 'JOIN', back: 'Kết hợp các dòng từ hai hay nhiều bảng dựa trên cột liên kết.', status: 'NEW' },
        { front: 'Primary Key', back: 'Khóa chính - cột duy nhất định danh mỗi hàng trong bảng.', status: 'NEW' },
        { front: 'Foreign Key', back: 'Khóa ngoại - cột liên kết đến khóa chính của bảng khác.', status: 'NEW' },
        { front: 'INDEX', back: 'Cấu trúc dữ liệu tăng tốc tìm kiếm bản ghi.', status: 'NEW' },
        { front: 'ACID properties', back: 'Bốn tính chất giao dịch: Atomicity, Consistency, Isolation, Durability.', status: 'NEW' },
      ],
    },
  ];

  console.log('Creating demo decks and cards...');

  const createdDecks: any[] = [];

  for (const deckTemplate of deckTemplates) {
    const createdDeck = await createDeckWithCards(user.id, deckTemplate);
    createdDecks.push(createdDeck);
  }

  console.log('Creating study logs...');

  await createStudyLogs(user.id, createdDecks);

  console.log('Creating badges...');

  const badges = await createBadges();

  console.log('Unlocking demo badges...');

  await unlockDemoBadges(user.id, badges);

  console.log('Demo data created successfully!');
  console.log(`Demo email: ${DEMO_EMAIL}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
