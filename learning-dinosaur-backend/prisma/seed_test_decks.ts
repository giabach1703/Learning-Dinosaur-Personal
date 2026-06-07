import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testDecks = [
  {
    name: 'Từ vựng tiếng Anh giao tiếp',
    description: '12 từ vựng tiếng Anh giao tiếp thông dụng nhất giúp bạn phản xạ nhanh chóng.',
    tags: ['tieng-anh', 'giao-tiep', 'tu-vung'],
    cards: [
      { front: 'gorgeous', back: 'cực kỳ đẹp, lộng lẫy' },
      { front: 'hilarious', back: 'cực kỳ vui nhộn, hài hước' },
      { front: 'exhausted', back: 'kiệt sức, cực kỳ mệt mỏi' },
      { front: 'anxious', back: 'lo lắng, bồn chồn' },
      { front: 'generous', back: 'rộng lượng, hào phóng' },
      { front: 'clumsy', back: 'vụng về, hậu đậu' },
      { front: 'obvious', back: 'rõ ràng, hiển nhiên' },
      { front: 'mysterious', back: 'bí ẩn, khó hiểu' },
      { front: 'curious', back: 'tò mò, ham học hỏi' },
      { front: 'stubborn', back: 'bướng bỉnh, cứng đầu' },
      { front: 'reliable', back: 'đáng tin cậy' },
      { front: 'ambitious', back: 'tham vọng, hoài bão' },
    ],
  },
  {
    name: 'Thủ đô các nước thế giới',
    description: 'Thủ đô của 12 quốc gia phổ biến trên thế giới, rất phù hợp để test game trắc nghiệm.',
    tags: ['dia-ly', 'thu-do', 'the-gioi'],
    cards: [
      { front: 'Việt Nam', back: 'Hà Nội' },
      { front: 'Nhật Bản', back: 'Tokyo' },
      { front: 'Hàn Quốc', back: 'Seoul' },
      { front: 'Pháp', back: 'Paris' },
      { front: 'Anh', back: 'London' },
      { front: 'Mỹ', back: 'Washington, D.C.' },
      { front: 'Úc', back: 'Canberra' },
      { front: 'Đức', back: 'Berlin' },
      { front: 'Ý', back: 'Rome' },
      { front: 'Trung Quốc', back: 'Bắc Kinh' },
      { front: 'Thái Lan', back: 'Bangkok' },
      { front: 'Nga', back: 'Moscow' },
    ],
  },
  {
    name: 'Lập trình Web & React cơ bản',
    description: 'Các khái niệm cơ bản về lập trình Frontend, HTML, CSS, JS và thư viện React.',
    tags: ['web', 'frontend', 'react', 'javascript'],
    cards: [
      { front: 'HTML', back: 'Ngôn ngữ đánh dấu siêu văn bản tạo cấu trúc web' },
      { front: 'CSS', back: 'Ngôn ngữ định dạng và tạo kiểu dáng cho trang web' },
      { front: 'JavaScript', back: 'Ngôn ngữ lập trình giúp tạo tính tương tác trên trang web' },
      { front: 'React.js', back: 'Thư viện JS phổ biến để xây dựng giao diện người dùng' },
      { front: 'State', back: 'Dữ liệu nội bộ của component, thay đổi sẽ trigger re-render' },
      { front: 'Props', back: 'Tham số truyền từ component cha xuống component con' },
      { front: 'Virtual DOM', back: 'Bản sao gọn nhẹ của DOM thật được React dùng để tối ưu hiệu năng' },
      { front: 'API', back: 'Giao diện lập trình ứng dụng giúp các phần mềm kết nối' },
      { front: 'Database', back: 'Cơ sở dữ liệu dùng để lưu trữ thông tin lâu dài' },
      { front: 'Server', back: 'Máy chủ xử lý yêu cầu và cung cấp dữ liệu cho client' },
    ],
  },
];

async function main() {
  console.log('Starting custom test seed...');
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in the database.`);

  if (users.length === 0) {
    console.log('No users found. Please register an account on the website first!');
    return;
  }

  for (const user of users) {
    console.log(`Processing user: ${user.displayName} (${user.email})...`);

    // Check existing decks for this user
    const existingDecks = await prisma.deck.findMany({
      where: { userId: user.id },
    });

    const existingNames = existingDecks.map((d) => d.name);

    for (const deckTemplate of testDecks) {
      if (existingNames.includes(deckTemplate.name)) {
        console.log(`- Deck "${deckTemplate.name}" already exists for this user. Skipping creation.`);
        continue;
      }

      console.log(`- Creating deck "${deckTemplate.name}"...`);

      // 1. Create tags
      const tagIds: string[] = [];
      for (const tagName of deckTemplate.tags) {
        const tag = await prisma.tag.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: tagName,
            },
          },
          update: {},
          create: {
            userId: user.id,
            name: tagName,
          },
        });
        tagIds.push(tag.id);
      }

      // 2. Create deck
      const deck = await prisma.deck.create({
        data: {
          userId: user.id,
          name: deckTemplate.name,
          description: deckTemplate.description,
        },
      });

      // 3. Connect deck tags
      for (const tagId of tagIds) {
        await prisma.deckTag.upsert({
          where: {
            deckId_tagId: {
              deckId: deck.id,
              tagId,
            },
          },
          update: {},
          create: {
            deckId: deck.id,
            tagId,
          },
        });
      }

      // 4. Create cards
      for (const cardData of deckTemplate.cards) {
        await prisma.card.create({
          data: {
            deckId: deck.id,
            front: cardData.front,
            back: cardData.back,
            status: 'NEW',
          },
        });
      }
      console.log(`  Successfully created deck "${deckTemplate.name}" with ${deckTemplate.cards.length} cards.`);
    }
  }

  console.log('Seed completed successfully for all users!');
}

main()
  .catch((e) => {
    console.error('Error during seeding custom test decks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
