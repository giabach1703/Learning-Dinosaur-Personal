import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Space, Typography, Tag, Input, Tabs, Modal, List, Badge, Breadcrumb, message, Empty } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  CompassOutlined,
  RightOutlined
} from '@ant-design/icons';
import { history } from 'umi';

const { Title, Text, Paragraph } = Typography;

interface ExerciseSolution {
  step: string;
  explanation: string;
  mathFormula?: string;
}

interface Textbook {
  id: string;
  title: string;
  edition: string;
  isbn: string;
  authors: string;
  solutionsCount: string;
  coverBg: string;
  coverPattern: string;
  chapters: {
    title: string;
    exercises: {
      number: string;
      steps: ExerciseSolution[];
    }[];
  }[];
}

const TEXTBOOKS_DATA: Record<string, Textbook[]> = {
  chemistry: [
    {
      id: 'chem_1',
      title: 'Hóa học: Khoa học trung tâm',
      edition: 'Ấn bản lần thứ 14',
      isbn: 'ISBN: 9780134414232',
      authors: 'Theodore L. Brown, H. Eugene LeMay, Bruce E. Bursten',
      solutionsCount: '7.762 giải pháp',
      coverBg: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
      coverPattern: '⚗️',
      chapters: [
        {
          title: 'Chương 1: Chất và phép đo',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Phân tích yêu cầu', explanation: 'Xác định trạng thái vật lý của nước ở ba nhiệt độ khác nhau: 25°C, 0°C, và 110°C ở áp suất 1 atm.' },
                { step: 'Bước 2: Đối chiếu lý thuyết', explanation: 'Điểm nóng chảy của nước là 0°C và điểm sôi là 100°C. Ở nhiệt độ giữa 0°C và 100°C, nước ở trạng thái lỏng. Ở nhiệt độ dưới 0°C, nước đông đặc thành đá (rắn). Ở nhiệt độ trên 100°C, nước bay hơi thành hơi nước (khí).' },
                { step: 'Bước 3: Kết luận', explanation: 'Trạng thái tại 25°C là Lỏng; tại 0°C là cân bằng Rắn-Lỏng; tại 110°C là Khí.' }
              ]
            },
            {
              number: 'Bài 1.2',
              steps: [
                { step: 'Bước 1: Công thức chuyển đổi nhiệt độ', explanation: 'Để chuyển đổi từ độ Celsius (°C) sang độ Fahrenheit (°F), sử dụng công thức:', mathFormula: 'T(°F) = T(°C) * 9/5 + 32' },
                { step: 'Bước 2: Thay số vào công thức', explanation: 'Với T(°C) = 25°C, ta tính:', mathFormula: 'T(°F) = 25 * 1.8 + 32 = 45 + 32 = 77' },
                { step: 'Bước 3: Đáp án', explanation: 'Nhiệt độ tương ứng là 77°F.' }
              ]
            },
            {
              number: 'Bài 1.3',
              steps: [
                { step: 'Bước 1: Xác định công thức tính khối lượng riêng (D)', explanation: 'Khối lượng riêng được tính bằng thương số giữa khối lượng (m) và thể tích (V):', mathFormula: 'D = m / V' },
                { step: 'Bước 2: Tính thể tích hình lập phương', explanation: 'Với cạnh a = 2.0 cm, thể tích là:', mathFormula: 'V = a^3 = 2.0 * 2.0 * 2.0 = 8.0 cm^3' },
                { step: 'Bước 3: Thực hiện phép tính', explanation: 'Cho khối lượng m = 154.4 g, ta có:', mathFormula: 'D = 154.4 / 8.0 = 19.3 g/cm^3' },
                { step: 'Bước 4: Kết luận', explanation: 'Khối lượng riêng của khối vàng là 19.3 g/cm^3, trùng khớp với giá trị lý thuyết của vàng ròng.' }
              ]
            }
          ]
        },
        {
          title: 'Chương 2: Cấu tạo nguyên tử, phân tử và các ion',
          exercises: [
            {
              number: 'Bài 2.1',
              steps: [
                { step: 'Bước 1: Định luật tuần hoàn', explanation: 'Giải thích tại sao các nguyên tố cùng nhóm có tính chất hóa học tương tự nhau.' },
                { step: 'Bước 2: Số electron lớp ngoài cùng', explanation: 'Các nguyên tố trong cùng một nhóm (cột dọc) có cùng số electron ở lớp vỏ ngoài cùng (electron hóa trị), quyết định cách chúng phản ứng hóa học.' }
              ]
            },
            {
              number: 'Bài 2.2',
              steps: [
                { step: 'Bước 1: Đọc kí hiệu nguyên tử', explanation: 'Kí hiệu Fe-56 cho biết số khối (A) là 56. Nguyên tố sắt (Fe) có số hiệu nguyên tử (Z) là 26.' },
                { step: 'Bước 2: Tính số các hạt cơ bản', explanation: 'Số proton = Z = 26. Trong nguyên tử trung hòa điện, số electron = số proton = 26. Số neutron được tính bằng:', mathFormula: 'N = A - Z = 56 - 26 = 30' },
                { step: 'Bước 3: Kết quả', explanation: 'Sắt-56 chứa 26 proton, 26 electron và 30 neutron.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'chem_2',
      title: 'Hóa học: Bản chất phân tử của vật chất',
      edition: 'Ấn bản lần thứ 7',
      isbn: 'ISBN: 9780073511177',
      authors: 'Patricia Amateis, Martin S. Silberberg',
      solutionsCount: '6.026 giải pháp',
      coverBg: 'linear-gradient(135deg, #be185d 0%, #831843 100%)',
      coverPattern: '🧬',
      chapters: [
        {
          title: 'Chương 1: Phép đo và các Khóa học cơ bản',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Định nghĩa độ bất định', explanation: 'Mỗi phép đo trong thực nghiệm luôn đi kèm một độ bất định nhất định do dụng cụ hoặc sai số người đọc.' },
                { step: 'Bước 2: Cách ghi số liệu chính xác', explanation: 'Ghi lại tất cả các chữ số chắc chắn cộng thêm một chữ số ước lượng cuối cùng.' }
              ]
            },
            {
              number: 'Bài 1.2',
              steps: [
                { step: 'Bước 1: Công thức tính nồng độ mol (C_M)', explanation: 'Nồng độ mol được tính bằng công thức:', mathFormula: 'C_M = n / V_L' },
                { step: 'Bước 2: Thay thế số liệu thực tế', explanation: 'Nếu hòa tan 0.5 mol đường vào 2 lít nước, ta có:', mathFormula: 'C_M = 0.5 / 2.0 = 0.25 M' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'chem_3',
      title: 'Hóa lý của Atkins',
      edition: 'Ấn bản lần thứ 11',
      isbn: 'ISBN: 9780198769866',
      authors: 'James Keeler, Julio de Paula, Peter Atkins',
      solutionsCount: '1.689 giải pháp',
      coverBg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
      coverPattern: '⚛️',
      chapters: [
        {
          title: 'Chương 1: Trạng thái khí lý tưởng và khí thực',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Phát biểu định luật khí lý tưởng', explanation: 'Phương trình trạng thái của khí lý tưởng liên hệ áp suất, thể tích, nhiệt độ và số mol:', mathFormula: 'P * V = n * R * T' },
                { step: 'Bước 2: Chuyển đổi đơn vị tiêu chuẩn', explanation: 'Đảm bảo áp suất tính bằng Pa hoặc atm, thể tích bằng m3 hoặc lít, nhiệt độ bằng Kelvin (T = t°C + 273.15).' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'chem_4',
      title: 'Hóa học hiện đại',
      edition: 'Ấn bản đầu tiên',
      isbn: 'ISBN: 9780547586632',
      authors: 'Jerry L. Sarquis, Mickey Sarquis',
      solutionsCount: '2.181 giải pháp',
      coverBg: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
      coverPattern: '🧪',
      chapters: [
        {
          title: 'Chương 1: Cân bằng hóa học trong dung dịch',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Viết biểu thức hằng số Kc', explanation: 'Cho phản ứng N2(k) + 3H2(k) <=> 2NH3(k), ta có:', mathFormula: 'Kc = [NH3]^2 / ([N2] * [H2]^3)' },
                { step: 'Bước 2: Thay thế nồng độ lúc cân bằng để tính Kc', explanation: 'Điền các giá trị thực nghiệm vào biểu thức trên để rút ra giá trị hằng số cân bằng.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'chem_5',
      title: 'Hóa học hữu cơ',
      edition: 'Ấn bản lần thứ 8',
      isbn: 'ISBN: 9781119316152',
      authors: 'David Klein, Brent L. Iverson',
      solutionsCount: '3.364 giải pháp',
      coverBg: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
      coverPattern: '🍀',
      chapters: [
        {
          title: 'Chương 1: Danh pháp IUPAC của alkan',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Chọn mạch carbon dài nhất', explanation: 'Tìm mạch carbon liên tục dài nhất làm mạch chính. Mạch này sẽ xác định tên gốc hydrocacbon chính.' },
                { step: 'Bước 2: Đánh số mạch carbon', explanation: 'Đánh số bắt đầu từ đầu mạch gần nhánh thế nhất sao cho tổng số chỉ vị trí nhánh thế là nhỏ nhất.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  calculus: [
    {
      id: 'calc_1',
      title: 'Giải tích 1: Hàm số và Giới hạn',
      edition: 'Ấn bản lần thứ 8',
      isbn: 'ISBN: 9781285740621',
      authors: 'James Stewart',
      solutionsCount: '4.892 giải pháp',
      coverBg: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
      coverPattern: '📈',
      chapters: [
        {
          title: 'Chương 1: Giới hạn và Đạo hàm',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Định nghĩa giới hạn vô định', explanation: 'Tìm giới hạn lim (x->3) (x^2 - 9)/(x - 3). Dạng này có dạng 0/0 khi thế trực tiếp x = 3.' },
                { step: 'Bước 2: Phân tích tử thức thành nhân tử', explanation: 'Tử thức x^2 - 9 = (x - 3)(x + 3). Thay vào biểu thức giới hạn:', mathFormula: 'lim (x->3) [(x-3)(x+3)] / (x-3) = lim (x->3) (x+3)' },
                { step: 'Bước 3: Thay số trực tiếp', explanation: 'Khi khử được đại lượng vô định (x - 3), ta thế trực tiếp x = 3 vào:', mathFormula: 'lim (x->3) (x+3) = 3 + 3 = 6' }
              ]
            },
            {
              number: 'Bài 1.2',
              steps: [
                { step: 'Bước 1: Quy tắc tính đạo hàm bằng định nghĩa', explanation: 'Tính đạo hàm của f(x) = x^2 tại x = a.', mathFormula: "f'(a) = lim (h->0) [f(a+h) - f(a)] / h" },
                { step: 'Bước 2: Khai triển biểu thức đạo hàm', explanation: 'Thế f(x) vào công thức:', mathFormula: "lim (h->0) [(a+h)^2 - a^2] / h = lim (h->0) [a^2 + 2ah + h^2 - a^2] / h" },
                { step: 'Bước 3: Khử h ở mẫu', explanation: 'Rút gọn h trên tử và mẫu:', mathFormula: 'lim (h->0) [h(2a + h)] / h = lim (h->0) (2a + h) = 2a' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'calc_2',
      title: 'Thomas\' Calculus: Tích phân',
      edition: 'Ấn bản lần thứ 13',
      isbn: 'ISBN: 9780321878960',
      authors: 'George B. Thomas, Maurice D. Weir, Joel R. Hass',
      solutionsCount: '5.120 giải pháp',
      coverBg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
      coverPattern: '📐',
      chapters: [
        {
          title: 'Chương 5: Tích phân xác định và diện tích',
          exercises: [
            {
              number: 'Bài 5.1',
              steps: [
                { step: 'Bước 1: Công thức tích phân cơ bản', explanation: 'Tính tích phân xác định của hàm số f(x) = x từ 0 đến 2.', mathFormula: 'Integral (0 to 2) x dx' },
                { step: 'Bước 2: Tìm nguyên hàm', explanation: 'Nguyên hàm của x là x^2 / 2.', mathFormula: 'F(x) = [x^2 / 2] (từ 0 đến 2)' },
                { step: 'Bước 3: Thay các cận', explanation: 'Tính toán cận trên trừ cận dưới:', mathFormula: 'F(2) - F(0) = (2^2 / 2) - 0 = 4 / 2 = 2' }
              ]
            }
          ]
        }
      ]
    }
  ],
  algebra: [
    {
      id: 'alg_1',
      title: 'Đại số tuyến tính ứng dụng',
      edition: 'Ấn bản lần thứ 5',
      isbn: 'ISBN: 9780321982384',
      authors: 'David C. Lay, Steven R. Lay, Judi J. McDonald',
      solutionsCount: '3.150 giải pháp',
      coverBg: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
      coverPattern: '🧮',
      chapters: [
        {
          title: 'Chương 1: Hệ phương trình tuyến tính và ma trận',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Viết ma trận hệ số mở rộng', explanation: 'Đưa hệ phương trình tuyến tính về dạng ma trận mở rộng [A|b] để chuẩn bị khử Gauss.' },
                { step: 'Bước 2: Các phép biến đổi sơ cấp hàng', explanation: 'Dùng các phép nhân hàng với hằng số, đổi chỗ hàng hoặc cộng một hàng với bội số hàng khác để đưa ma trận về dạng bậc thang.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  physics: [
    {
      id: 'phys_1',
      title: 'Cơ học Đại cương',
      edition: 'Ấn bản lần thứ 10',
      isbn: 'ISBN: 9781118230725',
      authors: 'David Halliday, Robert Resnick, Jearl Walker',
      solutionsCount: '5.200 giải pháp',
      coverBg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
      coverPattern: '⚡',
      chapters: [
        {
          title: 'Chương 2: Chuyển động thẳng biến đổi đều',
          exercises: [
            {
              number: 'Bài 2.1',
              steps: [
                { step: 'Bước 1: Xác định công thức chuyển động', explanation: 'Sử dụng công thức liên hệ vận tốc, gia tốc và quãng đường đi được:', mathFormula: 'v^2 - v0^2 = 2 * a * s' },
                { step: 'Bước 2: Thay thế số liệu để tìm gia tốc (a)', explanation: 'Thế v = 0 (dừng hẳn), vận tốc đầu v0 và quãng đường phanh s để giải ra a.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  biology: [
    {
      id: 'bio_1',
      title: 'Campbell Biology',
      edition: 'Ấn bản lần thứ 11',
      isbn: 'ISBN: 9780134093413',
      authors: 'Lisa A. Urry, Michael L. Cain, Peter V. Minorsky',
      solutionsCount: '4.500 giải pháp',
      coverBg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
      coverPattern: '🌿',
      chapters: [
        {
          title: 'Chương 6: Khám phá tế bào học',
          exercises: [
            {
              number: 'Bài 6.1',
              steps: [
                { step: 'Bước 1: Cấu trúc màng tế bào', explanation: 'Màng sinh chất cấu tạo từ lớp kép phospholipid có tính khảm động, kiểm soát các chất ra vào tế bào.' },
                { step: 'Bước 2: Vai trò của các bào quan', explanation: 'Ty thể đóng vai trò hô hấp tế bào sản sinh năng lượng ATP; nhân tế bào chứa vật chất di truyền ADN điều khiển mọi hoạt động.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  languages: [
    {
      id: 'lang_1',
      title: 'English Grammar in Use',
      edition: 'Ấn bản lần thứ 5',
      isbn: 'ISBN: 9781108457651',
      authors: 'Raymond Murphy',
      solutionsCount: '2.500 giải pháp',
      coverBg: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
      coverPattern: '🇬🇧',
      chapters: [
        {
          title: 'Unit 1: Present Continuous and Present Simple',
          exercises: [
            {
              number: 'Bài 1.1',
              steps: [
                { step: 'Bước 1: Phân biệt thì Hiện tại tiếp diễn', explanation: 'Thì Hiện tại tiếp diễn (am/is/are + V-ing) dùng cho hành động đang diễn ra ngay tại thời điểm nói hoặc có tính tạm thời.' },
                { step: 'Bước 2: Phân biệt thì Hiện tại đơn', explanation: 'Thì Hiện tại đơn (S + V/V-s/V-es) dùng cho thói quen, chân lý hiển nhiên hoặc hành động lặp đi lặp lại có tính lâu dài.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  business: [
    {
      id: 'biz_1',
      title: 'Kinh tế học Vĩ mô',
      edition: 'Ấn bản lần thứ 8',
      isbn: 'ISBN: 9781305971509',
      authors: 'N. Gregory Mankiw',
      solutionsCount: '3.890 giải pháp',
      coverBg: 'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
      coverPattern: '📊',
      chapters: [
        {
          title: 'Chương 4: Lực lượng cung và cầu trên thị trường',
          exercises: [
            {
              number: 'Bài 4.1',
              steps: [
                { step: 'Bước 1: Thiết lập phương trình cân bằng', explanation: 'Điểm cân bằng thị trường xảy ra khi lượng cung bằng lượng cầu:', mathFormula: 'Qd = Qs' },
                { step: 'Bước 2: Tìm giá cân bằng (P)', explanation: 'Giải phương trình Qd(P) = Qs(P) để tìm ra mức giá tối ưu cân bằng lượng cung cầu.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  arts: [
    {
      id: 'arts_1',
      title: 'Lịch sử Nghệ thuật phương Tây',
      edition: 'Ấn bản lần thứ 16',
      isbn: 'ISBN: 9781133954811',
      authors: 'Fred S. Kleiner',
      solutionsCount: '1.200 giải pháp',
      coverBg: 'linear-gradient(135deg, #db2777 0%, #831843 100%)',
      coverPattern: '🎨',
      chapters: [
        {
          title: 'Chương 14: Nghệ thuật Phục Hưng ở Ý',
          exercises: [
            {
              number: 'Bài 14.1',
              steps: [
                { step: 'Bước 1: Kỹ thuật phối cảnh tuyến tính', explanation: 'Filippo Brunelleschi phát minh ra phép vẽ phối cảnh một điểm tụ giúp vẽ tranh 3D chính xác trên mặt phẳng 2D.' },
                { step: 'Bước 2: Phong cách vẽ Sfumato', explanation: 'Kỹ thuật trộn các màu sắc và bóng tối mượt mà của Da Vinci giúp tạo chiều sâu và không để lại viền vẽ sắc nét.' }
              ]
            }
          ]
        }
      ]
    }
  ],
  social: [
    {
      id: 'soc_1',
      title: 'Tâm lý học Đại cương',
      edition: 'Ấn bản lần thứ 12',
      isbn: 'ISBN: 9781319050634',
      authors: 'David G. Myers, C. Nathan DeWall',
      solutionsCount: '2.800 giải pháp',
      coverBg: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
      coverPattern: '🧠',
      chapters: [
        {
          title: 'Chương 7: Thuyết hành vi và học tập',
          exercises: [
            {
              number: 'Bài 7.1',
              steps: [
                { step: 'Bước 1: Phản xạ có điều kiện cổ điển', explanation: 'Ivan Pavlov thực hiện thí nghiệm rung chuông khi cho chó ăn, tạo ra phản xạ tiết nước bọt khi nghe tiếng chuông.' },
                { step: 'Bước 2: Phản xạ có điều kiện tạo tác', explanation: 'B.F. Skinner chứng minh việc củng cố hành vi thông qua các phần thưởng (phần thưởng tích cực/tiêu cực) hoặc hình phạt.' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const SUBJECT_LABELS = [
  { key: 'chemistry', label: 'Hóa học' },
  { key: 'calculus', label: 'Giải tích' },
  { key: 'algebra', label: 'Đại số tuyến tính' },
  { key: 'physics', label: 'Vật lý' },
  { key: 'biology', label: 'Sinh vật học' },
  { key: 'languages', label: 'Ngôn ngữ' },
  { key: 'business', label: 'Việc kinh doanh' },
  { key: 'arts', label: 'Nghệ thuật và Nhân văn' },
  { key: 'social', label: 'Khoa học xã hội' },
];

const EXPLORE_TOPICS = [
  { label: 'Nghệ thuật và Nhân văn', icon: '🎨', color: '#fff5f5', border: '#fed7d7' },
  { label: 'Ngôn ngữ', icon: '🗣️', color: '#faf5ff', border: '#e9d8fd' },
  { label: 'Toán học', icon: '📐', color: '#fffbeb', border: '#fef3c7' },
  { label: 'Khoa học', icon: '🧪', color: '#f0fdf4', border: '#bbf7d0' },
  { label: 'Khoa học xã hội', icon: '📖', color: '#f0f9ff', border: '#bae6fd' },
  { label: 'Khác', icon: '💻', color: '#f8fafc', border: '#cbd5e1' },
];

const ExpertSolutionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('chemistry');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Textbook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hiệu ứng load dữ liệu cho trang
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleBookClick = (book: Textbook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedExercise(null);
  };

  const getFilteredBooks = () => {
    const list = TEXTBOOKS_DATA[activeTab] || [];
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.authors.toLowerCase().includes(query) ||
        b.isbn.toLowerCase().includes(query)
    );
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', width: '100%', background: '#ffffff' }}>
        <div className="dino-animation">🦕</div>
        <div className="splash-spinner-container">
          <div className="splash-spinner"></div>
        </div>
        <div className="splash-text">Đang kết nối thư viện giải pháp chuyên gia...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '24px 16px' }}>
      
      {/* Back to main home if inside textbook view */}
      {selectedBook ? (
        <div style={{ maxWidth: '1100px', margin: '0 auto', marginBottom: '24px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => setSelectedBook(null)}
            style={{ borderRadius: '8px', fontWeight: 600, color: '#586380' }}
          >
            Quay lại tìm kiếm
          </Button>

          <Card
            style={{
              borderRadius: '20px',
              border: '1px solid #edf0ee',
              marginTop: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6}>
                <div style={{
                  height: '200px',
                  background: selectedBook.coverBg,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                }}>
                  {selectedBook.coverPattern}
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Tag color="blue" style={{ borderRadius: '4px', fontWeight: 700 }}>{selectedBook.solutionsCount}</Tag>
                  <Title level={3} style={{ color: '#2e3856', fontWeight: 800, margin: 0 }}>
                    {selectedBook.title}
                  </Title>
                  <Text type="secondary" style={{ display: 'block', fontSize: '14px' }}>
                    {selectedBook.edition} • {selectedBook.isbn}
                  </Text>
                  <Text strong style={{ color: '#586380', fontSize: '13px' }}>
                    Tác giả: {selectedBook.authors}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[20, 20]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={10}>
              <Card
                title={<span style={{ color: '#2e3856', fontWeight: 800 }}>Mục lục chương</span>}
                style={{ borderRadius: '18px', border: '1px solid #edf0ee' }}
                bodyStyle={{ padding: '16px' }}
              >
                {selectedBook.chapters.length === 0 ? (
                  <Empty description="Lời giải đang được cập nhật thêm..." />
                ) : (
                  <List
                    dataSource={selectedBook.chapters}
                    renderItem={(chapter) => (
                      <List.Item
                        onClick={() => { setSelectedChapter(chapter); setSelectedExercise(null); }}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedChapter?.title === chapter.title ? '#f5f8ff' : 'transparent',
                          border: selectedChapter?.title === chapter.title ? '1px solid #c7d2fe' : 'none',
                          marginBottom: '6px',
                          transition: 'all 0.2s'
                        }}
                        className="chapter-list-item"
                      >
                        <Text strong style={{ color: selectedChapter?.title === chapter.title ? '#2563eb' : '#2e3856' }}>
                          {chapter.title}
                        </Text>
                        <RightOutlined style={{ fontSize: '12px', color: '#94a3b8' }} />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} md={14}>
              {selectedChapter ? (
                <Card
                  title={<span style={{ color: '#2e3856', fontWeight: 800 }}>Danh sách bài tập ({selectedChapter.title})</span>}
                  style={{ borderRadius: '18px', border: '1px solid #edf0ee' }}
                >
                  <Row gutter={[12, 12]}>
                    {selectedChapter.exercises.map((ex: any) => (
                      <Col span={8} key={ex.number}>
                        <Button
                          block
                          style={{
                            height: '48px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            color: selectedExercise?.number === ex.number ? '#ffffff' : '#2e3856',
                            background: selectedExercise?.number === ex.number ? '#2563eb' : '#ffffff',
                            borderColor: selectedExercise?.number === ex.number ? '#2563eb' : '#d9d9d9',
                          }}
                          onClick={() => setSelectedExercise(ex)}
                        >
                          {ex.number}
                        </Button>
                      </Col>
                    ))}
                  </Row>

                  {/* Solution steps */}
                  {selectedExercise && (
                    <div style={{ marginTop: '24px', borderTop: '1px solid #edf0ee', paddingTop: '20px' }}>
                      <Title level={4} style={{ color: '#2e3856', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#10b981' }} /> Lời giải từ chuyên gia
                      </Title>
                      
                      {selectedExercise.steps.map((step: ExerciseSolution, sIdx: number) => (
                        <Card
                          key={sIdx}
                          style={{
                            borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            marginBottom: '16px'
                          }}
                          bodyStyle={{ padding: '16px' }}
                        >
                          <Text strong style={{ color: '#2563eb', display: 'block', marginBottom: '8px' }}>
                            {step.step}
                          </Text>
                          <Paragraph style={{ color: '#2e3856', fontSize: '13px', margin: 0 }}>
                            {step.explanation}
                          </Paragraph>
                          {step.mathFormula && (
                            <div style={{
                              background: '#f1f5f9',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              borderLeft: '4px solid #2563eb',
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              color: '#1e293b',
                              marginTop: '10px',
                              fontWeight: 600
                            }}>
                              {step.mathFormula}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ) : (
                <Card style={{ borderRadius: '18px', border: '1px solid #edf0ee', textAlign: 'center', padding: '40px 20px' }}>
                  <ReadOutlined style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
                  <Text type="secondary" style={{ display: 'block' }}>Vui lòng chọn một chương ở mục lục để hiển thị các bài tập.</Text>
                </Card>
              )}
            </Col>
          </Row>
        </div>
      ) : (
        /* Normal search screen (Images 3, 4, 5) */
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Hero Banner Grid (Image 3) */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '24px',
            padding: '40px 32px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={14}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Title level={2} style={{ color: '#1e3a8a', fontWeight: 800, margin: 0, fontSize: '32px', lineHeight: '1.25' }}>
                    Tìm kiếm các giải pháp sách giáo khoa đáng tin cậy
                  </Title>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <Space style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: '16px' }}>📗</Text>
                      <Text strong style={{ color: '#1e293b', fontSize: '13px' }}>Giải thích từng bước</Text>
                    </Space>
                    <Space style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: '16px' }}>📝</Text>
                      <Text strong style={{ color: '#1e293b', fontSize: '13px' }}>Câu trả lời do chuyên gia biên soạn và đã được kiểm chứng</Text>
                    </Space>
                    <Space style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Text style={{ fontSize: '16px' }}>🗂️</Text>
                      <Text strong style={{ color: '#1e293b', fontSize: '13px' }}>Hàng triệu lời giải cho các sách giáo khoa phổ biến</Text>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col xs={0} md={10} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '120px', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))' }}>📖</div>
              </Col>
            </Row>
          </div>

          {/* Search box (Image 3) */}
          <div style={{ marginBottom: '32px' }}>
            <Input
              size="large"
              prefix={<SearchOutlined style={{ color: '#939bb4', marginRight: '8px' }} />}
              placeholder="Tìm kiếm sách giáo khoa, mã ISBN, câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: '12px',
                height: '56px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                border: '1px solid #edf0ee',
                fontSize: '15px'
              }}
            />
          </div>

          {/* Tab Categories for subject search (Image 3 & 4) */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ color: '#2e3856', fontWeight: 800, marginBottom: '16px' }}>
              Tìm kiếm theo chủ đề
            </Title>

            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarStyle={{ borderBottom: '1px solid #edf0ee' }}
              style={{ marginBottom: '20px' }}
            >
              {SUBJECT_LABELS.map(sub => (
                <Tabs.TabPane tab={sub.label} key={sub.key} />
              ))}
            </Tabs>

            {/* Book list */}
            {getFilteredBooks().length === 0 ? (
              <Empty description="Không tìm thấy sách phù hợp cho môn học này." />
            ) : (
              <Row gutter={[20, 20]}>
                {getFilteredBooks().map(book => (
                  <Col xs={24} sm={12} md={8} lg={8} key={book.id}>
                    <Card
                      hoverable
                      onClick={() => handleBookClick(book)}
                      style={{
                        borderRadius: '16px',
                        border: '1px solid #edf0ee',
                        overflow: 'hidden',
                        height: '100%',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.01)'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div style={{ display: 'flex', gap: '16px', height: '100%', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '72px',
                          height: '96px',
                          background: book.coverBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          color: '#ffffff',
                          flexShrink: 0
                        }}>
                          {book.coverPattern}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <Text strong style={{ color: '#2e3856', fontSize: '14px', lineHeight: '1.3' }}>
                            {book.title}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            {book.edition} • {book.isbn}
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#586380', marginTop: '6px' }} ellipsis>
                            {book.authors}
                          </Text>
                          
                          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                            <Tag color="success" style={{ borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                              {book.solutionsCount}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <div style={{ marginTop: '24px', textAlign: 'left' }}>
              <Button
                type="link"
                style={{ color: '#2563eb', fontWeight: 700, padding: 0 }}
                onClick={() => message.info(`Tất cả sách giáo khoa của môn ${SUBJECT_LABELS.find(s => s.key === activeTab)?.label} đã được hiển thị đầy đủ bên dưới.`)}
              >
                Xem tất cả trong {SUBJECT_LABELS.find(s => s.key === activeTab)?.label} <RightOutlined style={{ fontSize: '12px' }} />
              </Button>
            </div>
          </div>

          {/* Explore Bottom Grid (Image 5) */}
          <div style={{ borderTop: '1px solid #edf0ee', paddingTop: '32px', marginTop: '40px' }}>
            <Title level={3} style={{ color: '#2e3856', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>
              Khám phá sách giáo khoa của chúng tôi theo chủ đề
            </Title>
            
            <Row gutter={[16, 16]}>
              {EXPLORE_TOPICS.map((topic, index) => (
                <Col xs={24} sm={12} md={8} lg={8} key={index}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: '16px',
                      background: topic.color,
                      border: `1px solid ${topic.border}`,
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                    bodyStyle={{ padding: '24px 16px' }}
                    onClick={() => {
                      if (topic.label === 'Nghệ thuật và Nhân văn') setActiveTab('arts');
                      else if (topic.label === 'Ngôn ngữ') setActiveTab('languages');
                      else if (topic.label === 'Toán học') setActiveTab('calculus');
                      else if (topic.label === 'Khoa học') setActiveTab('chemistry');
                      else if (topic.label === 'Khoa học xã hội') setActiveTab('social');
                      else if (topic.label === 'Khác') setActiveTab('business');
                      
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                      message.success(`Đang mở chuyên mục ${topic.label}`);
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{topic.icon}</div>
                    <Text strong style={{ color: '#2e3856', fontSize: '15px' }}>
                      {topic.label}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

        </div>
      )}
    </div>
  );
};

export default ExpertSolutionsPage;
