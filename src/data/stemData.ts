import {
  AIToolEvaluation,
  ClassroomEvidenceItem,
  StudentAssignment,
  TeacherRubricState,
  VersionLogItem,
} from '../types';

export interface StemGroupMeta {
  id: 1 | 2 | 3 | 4;
  title: string;
  studentRange: string;
  objectives: string[];
  deliverable: string;
}

export const STEM_GROUPS_META: StemGroupMeta[] = [
  {
    id: 1,
    title: 'Nhóm 1 – Xây dựng ý tưởng & Mô hình Toán học',
    studentRange: 'HS01–HS10',
    objectives: [
      'Xác định vấn đề thực tiễn về thiết kế bồn chứa nước tại trường học và hộ gia đình.',
      'Nghiên cứu các dạng bồn nước phổ biến (trụ, nón cụt, thành cong).',
      'Xác định kiến thức Toán 12 Chương IV – Bài 13 (Ứng dụng hình học của tích phân).',
      'Đề xuất chức năng website, phác thảo giao diện và bộ công thức kiểm chứng.',
    ],
    deliverable: 'Bản thiết kế phác thảo giấy A0 và danh sách yêu cầu chức năng đã bàn giao cho Nhóm 2.',
  },
  {
    id: 2,
    title: 'Nhóm 2 – Viết Prompt & Tạo ứng dụng bằng Gemini',
    studentRange: 'HS11–HS20',
    objectives: [
      'Chuyển hóa bản yêu cầu của Nhóm 1 thành prompt kỹ thuật 18 mục có cấu trúc.',
      'Sử dụng Gemini trong Google AI Studio để sinh mã giao diện, mô hình 3D và động cơ tích phân.',
      'Chạy thử bản xem trước, đối chiếu công thức KaTeX và tinh chỉnh prompt qua từng vòng.',
    ],
    deliverable: 'Prompt v1, Prompt v2 đã hiệu chỉnh và bản ứng dụng demo hoạt động thực tế.',
  },
  {
    id: 3,
    title: 'Nhóm 3 – Khảo sát & So sánh công cụ AI',
    studentRange: 'HS21–HS30',
    objectives: [
      'Khảo sát thực nghiệm 3 công cụ: Google AI Studio (Gemini), Base44 và Google Antigravity.',
      'Thử nghiệm cùng bài toán chuẩn: dựng bồn trụ 3D chỉnh $R, H$ và tính $V = \\pi R^2 H$.',
      'Chấm điểm theo bộ 8 tiêu chí có minh chứng thực nghiệm đối chiếu trên lớp.',
    ],
    deliverable: 'Bảng đánh giá đối sánh 3 công cụ AI quy đổi thang 10 điểm và khuyến nghị cho THPT.',
  },
  {
    id: 4,
    title: 'Nhóm 4 – Tổng hợp, Kiểm thử & Hoàn thiện',
    studentRange: 'HS31–HS40',
    objectives: [
      'Tiếp nhận kết quả từ ba nhóm, hợp nhất nội dung và cấu hình hệ thống hoàn chỉnh.',
      'Đối chiếu 12/12 ca kiểm thử Toán học, máy tính Casio, bơm – xả và hiển thị điện thoại.',
      'Hoàn thiện hồ sơ minh chứng và báo cáo trình diễn tiết dạy STEM ngày 18/11.',
    ],
    deliverable: 'Website SMART WATER TANK 3D hoàn chỉnh kèm biên bản kiểm thử & minh chứng lớp học.',
  },
];

export const CLASSROOM_EVIDENCE_ITEMS: ClassroomEvidenceItem[] = [
  {
    id: 'ev_video_main',
    type: 'video',
    category: 'lecture',
    title: 'Video tổng hợp tiết dạy thực nghiệm STEM Toán 12 – SMART WATER TANK 3D',
    caption:
      'Tổng hợp trực quan tiến trình tiết dạy chuyên đề Bài 13 của GV Lê Văn Mạnh tại Trường THPT Nguyễn Huệ (ngày 18/11): từ bài toán bồn nước 60% chiều cao, 5 bước giải tích phân $V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$, mô phỏng Bơm – Xả phi tuyến đến đối sánh 3 công cụ AI.',
    src: '/assets/evidence/stem_demo_18_11.mp4',
    posterSrc: '/assets/evidence/ev_01_classroom_lecture.jpg',
    groupIds: [1, 2, 3, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_01',
    type: 'image',
    category: 'lecture',
    title: 'Khai mạc chuyên đề STEM: Học thể tích bằng tích phân & Mô phỏng 3D',
    caption:
      'GV Lê Văn Mạnh giới thiệu mục tiêu bài học STEM từ lát cắt 2D đến bồn chứa nước thông minh 3D trước tập thể học sinh lớp 12 Trường THPT Nguyễn Huệ.',
    src: '/assets/evidence/ev_01_classroom_lecture.jpg',
    groupIds: [1, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_02',
    type: 'image',
    category: 'lecture',
    title: 'Đặt vấn đề thực tiễn: Mực nước 60% chiều cao có chứa 60% dung tích?',
    caption:
      'Tình huống khởi động do Nhóm 1 khảo sát và đề xuất: khơi gợi nhu cầu dùng tích phân khi bồn chứa có tiết diện thay đổi theo độ cao $z$.',
    src: '/assets/evidence/ev_02_problem_60pct.jpg',
    groupIds: [1],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_10',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Học sinh trực tiếp trải nghiệm mô hình bồn nón cụt 3D trên Laptop',
    caption:
      'Thành viên Nhóm 2 và Nhóm 4 kiểm thử thao tác xoay $360^\\circ$, quan sát mặt cắt và thông số dung tích trên website SMART WATER TANK 3D.',
    src: '/assets/evidence/ev_10_laptop_3d.jpg',
    groupIds: [2, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_11',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Đối chiếu chéo kết quả AI – Web 3D bằng máy tính Casio fx-880BTG',
    caption:
      'Học sinh tính trực tiếp tích phân xác định trên máy tính Casio ClassWiz đặt cạnh laptop đang chạy Phòng Thiết kế Bồn nước 3D để kiểm chứng độ chính xác.',
    src: '/assets/evidence/ev_11_casio_check.jpg',
    groupIds: [2, 3, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_15',
    type: 'image',
    category: 'group_work',
    title: 'Toàn cảnh lớp học thực nghiệm & điều phối 4 nhóm dự án STEM ngày 18/11',
    caption:
      'Không gian tiết dạy thực nghiệm môn Toán 12 tại Trường THPT Nguyễn Huệ với đầy đủ 40 học sinh chia thành 4 nhóm chuyên trách.',
    src: '/assets/evidence/ev_15_classroom_wide.jpg',
    groupIds: [1, 2, 3, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_03',
    type: 'image',
    category: 'lecture',
    title: 'Giao diện Trang chủ & Chuỗi 6 bước sư phạm STEM Toán 12',
    caption:
      'Bản hoàn thiện Trang chủ hiển thị mô hình bồn 3D tương tác trực tiếp và công thức $\\displaystyle V_{\\text{water}}(h) = \\pi \\int_{0}^{h} [r(z)]^2\\,dz$.',
    src: '/assets/evidence/ev_03_overview_hero.jpg',
    groupIds: [1, 2],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_04',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Phòng Thiết kế Bồn nước 3D tương tác $360^\\circ$ & xuất tệp .GLB',
    caption:
      'Mô hình khối tròn xoay dựng bằng LatheGeometry từ hàm bán kính $r(z)$, hỗ trợ xem mặt cắt dọc và tính diện tích vỏ $S_{\\text{xq}}$.',
    src: '/assets/evidence/ev_04_design_3d.jpg',
    groupIds: [1, 2, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_06',
    type: 'image',
    category: 'lecture',
    title: 'Phòng Toán học: 5 bước giải tích phân KaTeX & lát cắt đĩa tròn xoay',
    caption:
      'Trình bày tường minh 5 bước lập và tính tích phân $\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$ chuẩn SGK Toán 12 Bài 13.',
    src: '/assets/evidence/ev_06_integral_5steps.jpg',
    groupIds: [1, 2],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_05',
    type: 'image',
    category: 'lecture',
    title: 'Phương trình vi phân – tích phân điều khiển mực nước phi tuyến $h(t)$',
    caption:
      'Chứng minh trực quan vì sao không được dùng công thức tuyến tính $h = \\frac{H \\cdot V}{V_{\\max}}$ cho bồn nón cụt hay bồn thành cong.',
    src: '/assets/evidence/ev_05_pump_formula.jpg',
    groupIds: [1, 2],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_09',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Mô phỏng thời gian thực quá trình Bơm đầy – Xả cạn bồn chứa 3D',
    caption:
      'Đồng hồ thông minh theo dõi lưu lượng $Q_{\\text{vào}}, Q_{\\text{ra}}$, tốc độ dâng $\\frac{dh}{dt}$ và tự động chặn tràn tại $V_{\\max}$.',
    src: '/assets/evidence/ev_09_pump_live.jpg',
    groupIds: [2, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_12',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Hệ thống 4 đồ thị giải tích tương tác $r(z), V(h), V(t), \\frac{dh}{dt}$',
    caption:
      'Liên kết trực quan giữa biên dạng bán kính $r(z)$, thể tích tích lũy $V(h)$ và vận tốc dâng mực nước theo thời gian.',
    src: '/assets/evidence/ev_12_charts_4views.jpg',
    groupIds: [2, 3, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_13',
    type: 'image',
    category: 'lab_3d_casio',
    title: 'Đối chiếu đường cong thể tích phi tuyến $V(h)$ với kết quả bấm máy Casio',
    caption:
      'Xác nhận động cơ tích phân số Simpson 3/8 và chia đôi nghiệm đạt độ chính xác sai số $< 10^{-6}\\text{ m}^3$.',
    src: '/assets/evidence/ev_13_nonlinear_vh.jpg',
    groupIds: [1, 3],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_07',
    type: 'image',
    category: 'lecture',
    title: 'Ngân hàng 10 câu hỏi Trắc nghiệm Toán 12 phân hóa 3 mức độ',
    caption:
      'Hệ thống câu hỏi kiểm tra năng lực Nhận biết – Thông hiểu – Vận dụng gắn liền với thiết kế bồn chứa thực tế.',
    src: '/assets/evidence/ev_07_quiz_bank.jpg',
    groupIds: [1, 2, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_08',
    type: 'image',
    category: 'lecture',
    title: 'Lời giải chi tiết từng bước KaTeX cho bài tập thể tích khối tròn xoay',
    caption:
      'Học sinh tự đối chiếu đáp án và phân tích nguyên nhân sai lầm thường gặp (quên nhân $\\pi$ hoặc quên bình phương bán kính).',
    src: '/assets/evidence/ev_08_quiz_solution.jpg',
    groupIds: [1, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_16',
    type: 'image',
    category: 'group_work',
    title: 'Bảng khảo sát & Đối sánh thực nghiệm 3 công cụ AI của Nhóm 3',
    caption:
      'Kết quả chấm 8 tiêu chí thực nghiệm: Google AI Studio (Gemini) đạt $9{,}38/10$, Google Antigravity đạt $8{,}13/10$, Base44 đạt $6{,}88/10$.',
    src: '/assets/evidence/ev_16_ai_matrix.jpg',
    groupIds: [3],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_14',
    type: 'image',
    category: 'group_work',
    title: 'Kiểm thử giao diện đáp ứng trên điện thoại di động 5G không tràn ngang',
    caption:
      'Nhóm 4 (HS38) xác nhận thẻ tiến độ 40 học sinh và ma trận điểm AI hiển thị gọn gàng trên màn hình dọc di động.',
    src: '/assets/evidence/ev_14_mobile_5g.jpg',
    groupIds: [3, 4],
    dateLabel: '18/11/2026',
  },
  {
    id: 'ev_img_17',
    type: 'image',
    category: 'group_work',
    title: 'Biên bản vượt 12/12 ca kiểm thử Toán học & chức năng nội bộ (Test 01 – 12)',
    caption:
      'Nghiệm thu toàn diện độ chính xác thể tích hình trụ, nón cụt, bồn thành cong, bán cầu $\\frac{16\\pi}{3}$ và lưu trữ localStorage.',
    src: '/assets/evidence/ev_17_test_12suite.jpg',
    groupIds: [1, 2, 3, 4],
    dateLabel: '18/11/2026',
  },
];

export const INITIAL_STUDENTS: StudentAssignment[] = [
  // NHÓM 1: HS01 - HS10 (Xây dựng ý tưởng & Mô hình Toán học)
  {
    code: 'HS01',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Điều phối và chốt yêu cầu',
    status: 'completed',
    evidence: 'Biên bản chốt 6 phân hệ & sơ đồ nhóm A0 (18/11)',
    note: 'Đã thống nhất yêu cầu kỹ thuật bàn giao sang Nhóm 2',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_15',
  },
  {
    code: 'HS02',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Ghi chép ý tưởng',
    status: 'completed',
    evidence: 'Sổ biên bản thảo luận Nhóm 1 & ảnh giấy A0',
    note: 'Tổng hợp đầy đủ 10 ý tưởng thực tế từ các thành viên',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_15',
  },
  {
    code: 'HS03',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Nghiên cứu vấn đề thực tế',
    status: 'completed',
    evidence: 'Tình huống bồn 60% chiều cao trên slide mở đầu',
    note: 'Khảo sát bồn nước inox trường học & hộ gia đình',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_02',
  },
  {
    code: 'HS04',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Liệt kê chức năng',
    status: 'completed',
    evidence: 'Danh mục 6 màn hình & lộ trình 7 bước trải nghiệm',
    note: 'Đáp ứng trọn vẹn chuỗi Hàm số → Tích phân → 3D',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_03',
  },
  {
    code: 'HS05',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Phác thảo trang chủ',
    status: 'completed',
    evidence: 'Wireframe trang chủ & 3 nút điều hướng chính',
    note: 'Bố cục rõ thông tin trường, giáo viên và mô hình Hero 3D',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS06',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Phác thảo các dạng bồn',
    status: 'completed',
    evidence: 'Bản vẽ mặt cắt 4 dạng bồn (trụ, nón cụt, cong, bán cầu)',
    note: 'Xác định rõ miền giá trị $0 \\le z \\le H$ và trục $Oz$',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_04',
  },
  {
    code: 'HS07',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Kiểm tra công thức hình trụ, nón cụt',
    status: 'completed',
    evidence: 'Phiếu đối chiếu công thức SGK Bài 13 & Casio fx-580VN X',
    note: 'Khớp chính xác $V=\\pi R^2 H$ và $V=\\frac{\\pi H}{3}(r_0^2+r_0 r_1+r_1^2)$',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_13',
  },
  {
    code: 'HS08',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Nghiên cứu mực nước và lưu lượng',
    status: 'completed',
    evidence: 'Mô hình vi phân $\\frac{dh}{dt} = \\frac{Q_v - Q_r}{\\pi [r(h)]^2}$',
    note: 'Chứng minh không được dùng tỉ lệ tuyến tính cho bồn cong',
    reviewer: 'HS01 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_05',
  },
  {
    code: 'HS09',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Đề xuất đồ thị và bài tập',
    status: 'completed',
    evidence: 'Bộ 4 biểu đồ tương tác & ngân hàng 10 câu trắc nghiệm',
    note: 'Phân hóa đủ 3 mức độ Nhận biết – Thông hiểu – Vận dụng',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_08',
  },
  {
    code: 'HS10',
    groupId: 1,
    groupName: 'Nhóm 1 – Xây dựng ý tưởng',
    task: 'Trình bày và bàn giao ý tưởng',
    status: 'completed',
    evidence: 'Ảnh thuyết trình bảng A0 & biên bản bàn giao Nhóm 2',
    note: 'Trình bày mạch lạc, bàn giao đúng tiến độ kế hoạch',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_17',
  },

  // NHÓM 2: HS11 - HS20 (Viết Prompt & Tạo ứng dụng bằng Gemini)
  {
    code: 'HS11',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Tổng hợp prompt',
    status: 'completed',
    evidence: 'Tài liệu Prompt tổng thể 18 mục (I → XVIII)',
    note: 'Cấu trúc rõ vai trò, công nghệ, 3D, tích phân và 12 test',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_03',
  },
  {
    code: 'HS12',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Viết yêu cầu giao diện',
    status: 'completed',
    evidence: 'Đặc tả UI phòng thí nghiệm STEM & hiển thị KaTeX',
    note: 'Đảm bảo tiếng Việt chuẩn xác, hỗ trợ tốt màn hình di động',
    reviewer: 'HS11 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_10',
  },
  {
    code: 'HS13',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Viết yêu cầu mô hình 3D',
    status: 'completed',
    evidence: 'Prompt dựng lưới LatheGeometry Three.js + mặt cắt 2D/3D',
    note: 'Nước bám sát lòng bồn từ $z=0$ đến $z=h$, xuất được .GLB',
    reviewer: 'HS11 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_10',
  },
  {
    code: 'HS14',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Viết yêu cầu tính tích phân',
    status: 'completed',
    evidence: 'Đặc tả MathEngine (Simpson + chia đôi tìm nghiệm $h$)',
    note: 'Tuyệt đối không dùng eval, kiểm soát chặt miền xác định',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_06',
  },
  {
    code: 'HS15',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Xây dựng bồn hình trụ và nón cụt',
    status: 'completed',
    evidence: 'Mô hình trụ & nón cụt 3D chạy trên laptop lớp học',
    note: 'Đã kiểm chứng khớp công thức giải tích nguyên hàm',
    reviewer: 'HS11 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_10',
  },
  {
    code: 'HS16',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Xây dựng bồn thành cong',
    status: 'completed',
    evidence: 'Mô hình $r(z)=1+0{,}5\\sin(\\pi z/2)$ & ví dụ bán cầu $16\\pi/3$',
    note: 'Hiển thị trên TV lớp học trong video thực nghiệm (05:30)',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS17',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Mô phỏng bơm – xả',
    status: 'completed',
    evidence: 'Video trình diễn Bơm đầy / Xả nước trực tiếp trên lớp (05:52)',
    note: 'Đồng hồ thông minh, cảnh báo đầy/cạn và lưu lượng mượt mà',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS18',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Đồ thị và bài tập',
    status: 'completed',
    evidence: '4 đồ thị Recharts xuất PNG/CSV & phòng luyện tập 3 hoạt động',
    note: 'Tất cả biểu thức toán học hiển thị KaTeX sắc nét',
    reviewer: 'HS11 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_07',
  },
  {
    code: 'HS19',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Kiểm thử prompt, ghi lỗi',
    status: 'completed',
    evidence: 'Nhật ký hiệu chỉnh Prompt v1 → v2 (sửa hiển thị KaTeX)',
    note: 'Khắc phục triệt để lỗi ký tự Unicode công thức trắc nghiệm',
    reviewer: 'HS11 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_08',
  },
  {
    code: 'HS20',
    groupId: 2,
    groupName: 'Nhóm 2 – Viết prompt & Gemini',
    task: 'Trình diễn và bàn giao bản demo',
    status: 'completed',
    evidence: 'Bản triển khai toanhocthongminh12.netlify.app & AI Studio',
    note: 'Bàn giao đầy đủ mã nguồn cho Nhóm 4 kiểm thử tổng thể',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },

  // NHÓM 3: HS21 - HS30 (Khảo sát & So sánh công cụ AI)
  {
    code: 'HS21',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Xây dựng tiêu chí',
    status: 'completed',
    evidence: 'Khung 8 tiêu chí đánh giá (0–2 điểm/mục, quy đổi thang 10)',
    note: 'Thống nhất cùng bài toán chuẩn tạo bồn trụ 3D tính $V=\\pi R^2 H$',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_16',
  },
  {
    code: 'HS22',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Thử Google AI Studio',
    status: 'completed',
    evidence: 'Kết quả thực nghiệm Google AI Studio (Gemini): đạt 9,38/10',
    note: 'Sinh mã React + Three.js + KaTeX rất chính xác, dễ tinh chỉnh',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_11',
  },
  {
    code: 'HS23',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Thử Base44',
    status: 'completed',
    evidence: 'Biên bản thử nghiệm Base44: đạt 6,88/10 điểm',
    note: 'Tạo UI nhanh nhưng hạn chế tùy biến sâu hình học 3D phức tạp',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_14',
  },
  {
    code: 'HS24',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Tìm hiểu Antigravity',
    status: 'completed',
    evidence: 'Báo cáo thử nghiệm Google Antigravity: đạt 8,13/10 điểm',
    note: 'Mạnh về lập trình tác tử đa tệp nhưng cần kỹ năng cài đặt cao',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_16',
  },
  {
    code: 'HS25',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Kiểm tra khả năng 3D',
    status: 'completed',
    evidence: 'Bảng đối chiếu khung hình 3D xoay/mặt cắt trên laptop',
    note: 'AI Studio (Gemini) và Antigravity dựng LatheGeometry mượt nhất',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_10',
  },
  {
    code: 'HS26',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'So sánh khả năng tính toán',
    status: 'completed',
    evidence: 'Ảnh đối chiếu kết quả tích phân với máy tính Casio tại lớp',
    note: 'Xác nhận động cơ Simpson sai số $< 10^{-6}\\text{ m}^3$',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_12',
  },
  {
    code: 'HS27',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Tìm hiểu giới hạn sử dụng',
    status: 'completed',
    evidence: 'Bảng tổng hợp điều kiện tài khoản, chi phí & giới hạn miễn phí',
    note: 'Lưu ý quy định độ tuổi tài khoản và giám sát của giáo viên THPT',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_03',
  },
  {
    code: 'HS28',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Tìm hiểu lưu trữ, xuất bản',
    status: 'completed',
    evidence: 'Quy trình xuất mã ZIP/GitHub và triển khai lên Netlify',
    note: 'Đã chạy ổn định đường dẫn phục vụ tiết dạy trên lớp',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS29',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Tổng hợp ưu và nhược điểm',
    status: 'completed',
    evidence: 'Ma trận nhận xét ưu/nhược điểm thực tế của 3 nền tảng',
    note: 'Điền đầy đủ vào Bảng khảo sát & Đối sánh công cụ AI bên dưới',
    reviewer: 'HS21 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_15',
  },
  {
    code: 'HS30',
    groupId: 3,
    groupName: 'Nhóm 3 – So sánh công cụ AI',
    task: 'Báo cáo đề xuất',
    status: 'completed',
    evidence: 'Báo cáo khuyến nghị chọn Google AI Studio (Gemini) cho THPT',
    note: 'Thuyết trình trước lớp và được GV Lê Văn Mạnh thông qua',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_17',
  },

  // NHÓM 4: HS31 - HS40 (Tổng hợp, Kiểm thử & Hoàn thiện)
  {
    code: 'HS31',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Điều phối công việc cuối',
    status: 'completed',
    evidence: 'Biên bản nghiệm thu tổng hợp 4 nhóm & chốt Bản hoàn chỉnh',
    note: '100% thành viên (40/40 HS) hoàn thành nhiệm vụ đúng hạn',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_16',
  },
  {
    code: 'HS32',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Tổng hợp hồ sơ',
    status: 'completed',
    evidence: 'Tệp JSON tiến độ 40 HS + Bộ 18 ảnh/video thực nghiệm 18/11',
    note: 'Lưu trữ đầy đủ minh chứng dạy học tại THPT Nguyễn Huệ',
    reviewer: 'HS31 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_14',
  },
  {
    code: 'HS33',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Hoàn thiện giao diện',
    status: 'completed',
    evidence: 'Kiểm tra đồng bộ bảng màu, từ điển Việt – Anh & KaTeX',
    note: 'Hiển thị rõ nét khi chiếu trên màn hình TV lớp học',
    reviewer: 'HS31 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS34',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Kiểm tra hình trụ và nón cụt',
    status: 'completed',
    evidence: 'Test 01 ($2\\pi \\approx 6{,}283\\text{ m}^3$) & Test 02 ($7\\pi \\approx 21{,}991\\text{ m}^3$) Đạt',
    note: 'Đối chiếu khớp hoàn toàn máy tính Casio fx-880BTG',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_11',
  },
  {
    code: 'HS35',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Kiểm tra bồn cong',
    status: 'completed',
    evidence: 'Test 03 ($11{,}069\\text{ m}^3$) & Test 04 Bán cầu ($16{,}755\\text{ m}^3$) Đạt',
    note: 'Sai số tích phân số nhỏ hơn $10^{-6}\\text{ m}^3$',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_12',
  },
  {
    code: 'HS36',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Kiểm tra bơm – xả',
    status: 'completed',
    evidence: 'Test 05, 06 (chặn tràn $V_{\\max}$), 07 (chặn cạn $0$) đều Đạt',
    note: 'Đã kiểm chứng trực tiếp trên màn hình lớp học (06:00)',
    reviewer: 'HS31 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_video_main',
  },
  {
    code: 'HS37',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Kiểm tra xoay và zoom',
    status: 'completed',
    evidence: 'Ảnh kiểm thử OrbitControls 360°, mặt cắt & xuất tệp .GLB',
    note: 'Khung hình mượt, không mất mô hình khi kéo thanh trượt liên tục',
    reviewer: 'HS31 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_10',
  },
  {
    code: 'HS38',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Kiểm thử điện thoại',
    status: 'completed',
    evidence: 'Kiểm thử thực tế trên điện thoại di động 5G & máy tính bảng',
    note: 'Bố cục thẻ co giãn tốt, không tràn ngang bảng tiến độ & điểm AI',
    reviewer: 'HS31 / GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_14',
  },
  {
    code: 'HS39',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Ghi lỗi và kiểm thử lại',
    status: 'completed',
    evidence: 'Biên bản vượt 12/12 ca kiểm thử nội bộ (Test 01 – Test 12)',
    note: 'Đã rà soát không còn lỗi console hay lỗi hiển thị công thức',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_09',
  },
  {
    code: 'HS40',
    groupId: 4,
    groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện',
    task: 'Trình bày sản phẩm',
    status: 'completed',
    evidence: 'Video & bộ ảnh báo cáo tiết dạy STEM ngày 18/11 tại lớp',
    note: 'Hoàn thành xuất sắc buổi trình diễn tổng kết dự án STEM Toán 12',
    reviewer: 'GV Lê Văn Mạnh',
    evidenceMediaId: 'ev_img_17',
  },
];

export interface AIJudgeCriterion {
  id: string;
  label: string;
  weightFactor: number;
  description: string;
}

export const AI_TOOL_CRITERIA: AIJudgeCriterion[] = [
  { id: 'ease', label: '1. Dễ sử dụng', weightFactor: 1.25, description: 'Giao diện trực quan, dễ bắt đầu với học sinh THPT (0–2 điểm).' },
  { id: 'ui', label: '2. Tạo giao diện', weightFactor: 1.25, description: 'Khả năng sinh bố cục tiếng Việt rõ ràng, đáp ứng nhiều màn hình (0–2 điểm).' },
  { id: 'model3d', label: '3. Khả năng xây dựng 3D', weightFactor: 1.25, description: 'Dựng hình khối Three.js tương tác xoay/thu phóng thực (0–2 điểm).' },
  { id: 'math', label: '4. Tính đúng công thức', weightFactor: 1.25, description: 'Tính chính xác tích phân $\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$, không gán số giả (0–2 điểm).' },
  { id: 'edit', label: '5. Khả năng chỉnh sửa', weightFactor: 1.25, description: 'Cho phép cập nhật từng phần mã hoặc tinh chỉnh bằng prompt tiếp nối (0–2 điểm).' },
  { id: 'deploy', label: '6. Xuất mã và triển khai', weightFactor: 1.25, description: 'Tải mã nguồn ZIP/GitHub và build lên Vercel/Netlify (0–2 điểm).' },
  { id: 'access', label: '7. Điều kiện sử dụng', weightFactor: 1.25, description: 'Chi phí, tài khoản và giới hạn lượt dùng miễn phí (0–2 điểm).' },
  { id: 'highschool', label: '8. Phù hợp học sinh THPT', weightFactor: 1.25, description: 'Hỗ trợ học tập kiểm chứng Toán học và làm việc nhóm (0–2 điểm).' },
];

// Pre-populated with verified classroom benchmark results from Group 3 (HS21 - HS30)
export const INITIAL_AI_EVALUATIONS: AIToolEvaluation[] = [
  {
    toolId: 'aistudio_gemini',
    toolName: 'Google AI Studio (Gemini)',
    tested: true,
    scores: {
      ease: 2,
      ui: 2,
      model3d: 2,
      math: 2,
      edit: 2,
      deploy: 2,
      access: 1,
      highschool: 2,
    },
    evidence:
      'Thực nghiệm trực tiếp dự án SMART WATER TANK 3D + bản triển khai toanhocthongminh12.netlify.app (18/11)',
    pros: 'Ưu: Sinh mã React + Three.js (LatheGeometry) + KaTeX rất chuẩn xác, tính tích phân Simpson khớp máy tính Casio (< 0,001 m³), xem trước trực tiếp và xuất ZIP/GitHub triển khai Netlify dễ dàng. Nhược: Cần giáo viên định hướng tài khoản và kiểm chứng lại từng bước.',
    cons: 'Cần tài khoản Google đủ điều kiện độ tuổi hoặc sự hướng dẫn trực tiếp của giáo viên khi dùng ở THPT.',
    evidenceMediaId: 'ev_video_main',
  },
  {
    toolId: 'base44',
    toolName: 'Base44',
    tested: true,
    scores: {
      ease: 2,
      ui: 2,
      model3d: 1,
      math: 1,
      edit: 1,
      deploy: 1,
      access: 1,
      highschool: 2,
    },
    evidence: 'Biên bản thử nghiệm bài toán bồn trụ 3D của HS23 & HS25 – Nhóm 3 (15/11)',
    pros: 'Ưu: Khởi tạo giao diện trang quản trị và biểu mẫu tiếng Việt nhanh, thân thiện với người mới bắt đầu. Nhược: Hạn chế khi dựng lưới khối tròn xoay 3D tùy biến theo hàm r(z) bất kỳ, giới hạn lượt chỉnh sửa miễn phí và khó xuất mã nguồn độc lập.',
    cons: 'Khó tùy biến sâu hình học 3D phức tạp và bị giới hạn hạn mức tin nhắn miễn phí.',
    evidenceMediaId: 'ev_img_11',
  },
  {
    toolId: 'antigravity',
    toolName: 'Google Antigravity',
    tested: true,
    scores: {
      ease: 1,
      ui: 2,
      model3d: 2,
      math: 2,
      edit: 2,
      deploy: 2,
      access: 1,
      highschool: 1,
    },
    evidence: 'Báo cáo khảo sát & chạy thử môi trường lập trình tác tử của HS24 & HS26 – Nhóm 3 (16/11)',
    pros: 'Ưu: Môi trường IDE tác tử chuyên nghiệp, kiểm soát toàn diện cấu trúc đa tệp TypeScript, Three.js và chạy unit test tự động rất mạnh. Nhược: Giao diện kỹ thuật chuyên sâu, đòi hỏi thiết lập môi trường phức tạp hơn mặt bằng chung học sinh THPT.',
    cons: 'Độ dốc làm quen ban đầu cao hơn so với giao diện web trực tiếp của Google AI Studio.',
    evidenceMediaId: 'ev_img_16',
  },
];

export function computeAiToolScore10(ev: AIToolEvaluation): number | null {
  const vals = AI_TOOL_CRITERIA.map((c) => ev.scores[c.id]);
  const rated = vals.filter((v): v is number => v !== null && Number.isFinite(v));
  if (rated.length === 0) return null;
  const rawSum = rated.reduce((acc, v) => acc + v, 0);
  const maxPossible = rated.length * 2;
  return Number(((rawSum / maxPossible) * 10).toFixed(2));
}


export interface StemWorkflowStage {
  step: number;
  title: string;
  goal: string;
  owner: string;
  tasks: string[];
  deliverable: string;
  criteria: string;
}

export const STEM_WORKFLOW_STAGES: StemWorkflowStage[] = [
  {
    step: 1,
    title: 'Khảo sát vấn đề',
    goal: 'Gắn bài toán tích phân Toán 12 với nhu cầu đo dung tích và tiết kiệm vật liệu bồn chứa nước thực tế.',
    owner: 'Nhóm 1 (HS01–HS04)',
    tasks: [
      'Khảo sát bồn inox ngang/đứng tại trường học và gia đình.',
      'Xác định câu hỏi: Làm sao đo lượng nước trong bồn cong chỉ từ chiều cao mực nước $h$?',
    ],
    deliverable: 'Phiếu khảo sát thực tế và danh mục bài toán cần giải quyết.',
    criteria: 'Nêu rõ tối thiểu 3 dạng hình học bồn và các đại lượng đo đạc ($R, H, h, Q$).',
  },
  {
    step: 2,
    title: 'Phác thảo ý tưởng',
    goal: 'Thiết kế luồng màn hình, mô hình toán học tích phân và sơ đồ chức năng ứng dụng.',
    owner: 'Nhóm 1 (HS05–HS10)',
    tasks: [
      'Phác thảo 6 phòng chức năng của website trên giấy A0.',
      'Thiết lập công thức chuẩn cho bồn trụ, nón cụt, thành cong và bán cầu.',
    ],
    deliverable: 'Wireframe giao diện và bảng công thức chuẩn đối chiếu.',
    criteria: 'Đầy đủ 6 khu vực và công thức $\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$ kèm điều kiện miền xác định.',
  },
  {
    step: 3,
    title: 'Viết prompt Gemini',
    goal: 'Chuyển hóa thiết kế sư phạm thành đặc tả kỹ thuật rõ ràng cho mô hình AI.',
    owner: 'Nhóm 2 (HS11–HS14)',
    tasks: [
      'Phân tách prompt thành các mục: Vai trò, Công nghệ, 3D, Động cơ tích phân, Kiểm thử.',
      'Ràng buộc rõ yêu cầu không gán số giả và không dùng $h = \\dfrac{H \\cdot V}{V_{\\max}}$ cho bồn cong.',
    ],
    deliverable: 'Tài liệu Prompt v1 và Prompt cải tiến v2.',
    criteria: 'Prompt có cấu trúc rõ ràng, nêu đủ các trường hợp biên và bộ test chuẩn.',
  },
  {
    step: 4,
    title: 'So sánh công cụ',
    goal: 'Đánh giá khách quan các nền tảng tạo ứng dụng bằng AI dựa trên cùng một bài toán thử.',
    owner: 'Nhóm 3 (HS21–HS30)',
    tasks: [
      'Chạy bài toán chuẩn tạo bồn trụ 3D (chỉnh $R, H$, tính $V = \\pi R^2 H$) trên 3 công cụ.',
      'Ghi lại ảnh chụp màn hình/biên bản minh chứng và chấm điểm từng tiêu chí 0–2.',
    ],
    deliverable: 'Bảng đối sánh 3 công cụ AI quy đổi thang 10 điểm (9,38 – 6,88 – 8,13).',
    criteria: 'Mỗi điểm số đều kèm ghi chú thực nghiệm trung thực và đối chiếu Casio.',
  },
  {
    step: 5,
    title: 'Tạo ứng dụng',
    goal: 'Xây dựng và kết nối đầy đủ mô hình 3D, động cơ tích phân, mô phỏng bơm – xả và đồ thị.',
    owner: 'Nhóm 2 (HS15–HS20)',
    tasks: [
      'Dựng hình khối tròn xoay bằng LatheGeometry từ hàm $r(z)$.',
      'Lập trình giải phương trình tìm mực nước $h$ bằng phương pháp chia đôi.',
    ],
    deliverable: 'Bản ứng dụng chạy thực tế trong trình duyệt và triển khai trực tuyến.',
    criteria: 'Thay đổi thanh trượt cập nhật tức thời cả mô hình 3D, lời giải KaTeX và 4 đồ thị.',
  },
  {
    step: 6,
    title: 'Kiểm thử',
    goal: 'Xác minh độ chính xác Toán học, giới hạn vật lý và khả năng hiển thị đa thiết bị.',
    owner: 'Nhóm 4 (HS31–HS39)',
    tasks: [
      'Chạy 12 ca kiểm thử chuẩn (sai số thể tích $< 0{,}001\\text{ m}^3$).',
      'Kiểm tra trường hợp tràn bồn, cạn bồn, nhập số âm và màn hình điện thoại.',
    ],
    deliverable: 'Biên bản kiểm thử đạt 12/12 test cases và danh sách lỗi đã khắc phục.',
    criteria: 'Đạt 12/12 bài kiểm thử chuẩn, không phát sinh lỗi console.',
  },
  {
    step: 7,
    title: 'Trình diễn',
    goal: 'Báo cáo kết quả dự án STEM trước lớp và giáo viên phụ trách Lê Văn Mạnh.',
    owner: 'Nhóm 4 (HS40) & Đại diện 4 nhóm',
    tasks: [
      'Trình diễn trực tiếp chuỗi: Hàm số → Đồ thị → Tích phân → Khối 3D → Mực nước → Tối ưu.',
      'Tổng hợp điểm đánh giá dự án và lưu bộ hồ sơ video/ảnh thực nghiệm ngày 18/11.',
    ],
    deliverable: 'Tiết học chuyên đề STEM hoàn chỉnh và sản phẩm SMART WATER TANK 3D.',
    criteria: 'Giải thích mạch lạc bản chất tích phân và trả lời tốt câu hỏi phản biện.',
  },
];

export const INITIAL_VERSION_LOG: VersionLogItem[] = [
  {
    id: 'v_idea_1',
    versionName: 'Ý tưởng v1',
    description: 'Xác định bài toán thực tế (mực nước 60% chiều cao), chọn 4 loại bồn nước và bộ công thức Bài 13 Toán 12.',
    confirmed: true,
    confirmedBy: 'HS01 (Nhóm 1) & GV Lê Văn Mạnh',
    updatedAt: '10/11/2026',
  },
  {
    id: 'v_prompt_1',
    versionName: 'Prompt v1',
    description: 'Bản đặc tả 18 mục đầu tiên gửi vào Gemini trên Google AI Studio để sinh khung ứng dụng 6 phân hệ.',
    confirmed: true,
    confirmedBy: 'HS11 (Nhóm 2) & GV Lê Văn Mạnh',
    updatedAt: '12/11/2026',
  },
  {
    id: 'v_demo_1',
    versionName: 'Demo v1',
    description: 'Hoàn thành mô hình bồn trụ, nón cụt 3D và phép tính tích phân cơ bản đối chiếu Casio.',
    confirmed: true,
    confirmedBy: 'HS15, HS20 & GV Lê Văn Mạnh',
    updatedAt: '14/11/2026',
  },
  {
    id: 'v_demo_2',
    versionName: 'Demo v2',
    description: 'Bổ sung bồn thành cong, bán cầu $16\\pi/3$, hàm tùy chỉnh math.js, phòng Bơm – Xả và 4 đồ thị tương tác.',
    confirmed: true,
    confirmedBy: 'HS16, HS17 & GV Lê Văn Mạnh',
    updatedAt: '15/11/2026',
  },
  {
    id: 'v_test',
    versionName: 'Bản kiểm thử',
    description: 'Tích hợp 12/12 ca kiểm thử tự động Đạt, chuẩn hóa hiển thị KaTeX toàn hệ thống và tối ưu di động.',
    confirmed: true,
    confirmedBy: 'HS31, HS39 (Nhóm 4) & GV Lê Văn Mạnh',
    updatedAt: '17/11/2026',
  },
  {
    id: 'v_final',
    versionName: 'Bản hoàn chỉnh',
    description: 'Triển khai thực nghiệm thành công tiết dạy STEM Toán 12 ngày 18/11 tại Trường THPT Nguyễn Huệ, lưu đủ 40/40 minh chứng.',
    confirmed: true,
    confirmedBy: 'GV Lê Văn Mạnh (Nghiệm thu chuyên đề)',
    updatedAt: '18/11/2026',
  },
];

export const INITIAL_TEACHER_RUBRIC: TeacherRubricState = {
  mathAccuracy: 3.0,
  model3D: 2.0,
  geminiPrompt: 1.5,
  aiComparison: 1.0,
  teamCollaboration: 1.5,
  presentation: 0.75,
  teacherComment:
    'Dự án STEM thực hiện nghiêm túc, sáng tạo và bám sát chuẩn kiến thức Chương IV – Bài 13 Toán 12 (Kết nối tri thức với cuộc sống). Cả 4 nhóm (40 học sinh) phối hợp chặt chẽ từ khâu khảo sát thực tiễn, lập bản vẽ A0, thiết kế Prompt Gemini có cấu trúc, đối sánh khách quan 3 công cụ AI đến kiểm chứng chéo kết quả tích phân bằng máy tính cầm tay Casio và trình diễn thuyết phục trong tiết dạy thực nghiệm ngày 18/11 tại Trường THPT Nguyễn Huệ.',
};

export interface GlossaryItem {
  en: string;
  vi: string;
  phonetic: string;
  definitionVi: string;
}

export const STEM_GLOSSARY: GlossaryItem[] = [
  {
    en: 'Water Tank',
    vi: 'Bồn chứa nước',
    phonetic: '/ˈwɔːtər tæŋk/',
    definitionVi: 'Thiết bị hình khối dùng để tích trữ và cấp nước sinh hoạt hoặc sản xuất.',
  },
  {
    en: 'Volume',
    vi: 'Thể tích',
    phonetic: '/ˈvɒljuːm/',
    definitionVi: 'Lượng không gian ba chiều mà bồn hoặc khối nước chiếm chỗ, đo bằng $\\text{m}^3$ hoặc lít.',
  },
  {
    en: 'Integral',
    vi: 'Tích phân',
    phonetic: '/ˈɪntɪɡrəl/',
    definitionVi: 'Phép toán giải tích cộng dồn vô hạn các lát cắt vi phân $A(z)\\,dz$ để tính thể tích chính xác.',
  },
  {
    en: 'Radius',
    vi: 'Bán kính',
    phonetic: '/ˈreɪdiəs/',
    definitionVi: 'Khoảng cách từ trục đối xứng $Oz$ đến thành bồn tại độ cao $z$, ký hiệu $r(z)$.',
  },
  {
    en: 'Height',
    vi: 'Chiều cao',
    phonetic: '/haɪt/',
    definitionVi: 'Khoảng cách thẳng đứng từ đáy bồn $z = 0$ đến đỉnh bồn $z = H$.',
  },
  {
    en: 'Water Level',
    vi: 'Mực nước',
    phonetic: '/ˈwɔːtər ˈlevəl/',
    definitionVi: 'Độ cao mặt thoáng nằm ngang $h$ ($\\text{m}$) của lượng nước hiện có trong bồn.',
  },
  {
    en: 'Flow Rate',
    vi: 'Lưu lượng',
    phonetic: '/fləʊ reɪt/',
    definitionVi: 'Thể tích nước bơm vào ($Q_v$) hoặc xả ra ($Q_r$) trên một đơn vị thời gian ($\\text{m}^3/\\text{phút}$ hoặc $\\text{lít/phút}$).',
  },
  {
    en: 'Cylinder',
    vi: 'Hình trụ',
    phonetic: '/ˈsɪlɪndər/',
    definitionVi: 'Khối tròn xoay có bán kính mặt cắt ngang không đổi $r(z) = R$.',
  },
  {
    en: 'Frustum',
    vi: 'Hình nón cụt',
    phonetic: '/ˈfrʌstəm/',
    definitionVi: 'Khối tròn xoay có bán kính biến thiên bậc nhất từ đáy $r_0$ đến miệng $r_1$.',
  },
  {
    en: 'Surface Area',
    vi: 'Diện tích bề mặt',
    phonetic: '/ˈsɜːfɪs ˈeəriə/',
    definitionVi: 'Tổng diện tích vỏ thành, đáy và nắp bồn ($\\text{m}^2$), quyết định lượng vật liệu chế tạo.',
  },
  {
    en: 'Optimization',
    vi: 'Tối ưu hóa',
    phonetic: '/ˌɒptɪmaɪˈzeɪʃən/',
    definitionVi: 'Bài toán lựa chọn kích thước sao cho đạt dung tích yêu cầu với chi phí vật liệu hợp lý.',
  },
  {
    en: 'Three-dimensional Model',
    vi: 'Mô hình ba chiều',
    phonetic: '/θriː dɪˈmenʃənəl ˈmɒdəl/',
    definitionVi: 'Biểu diễn trực quan vật thể trong không gian $Oxyz$ cho phép xoay, cắt lớp và quan sát.',
  },
];

export interface MathAssistantQA {
  id: string;
  question: string;
  shortSummary: string;
  detailedAnswer: string;
  latex: string;
}

export const BUILTIN_MATH_QA: MathAssistantQA[] = [
  {
    id: 'why_integral',
    question: 'Vì sao phải dùng tích phân để tính thể tích bồn nước?',
    shortSummary: 'Vì khi bán kính $r(z)$ thay đổi theo chiều cao, các công thức hình học sơ cấp không còn áp dụng trực tiếp được.',
    detailedAnswer:
      'Với bồn hình trụ, tiết diện ngang không đổi nên chỉ cần lấy diện tích đáy nhân chiều cao. Tuy nhiên với bồn thành cong, bồn cầu hoặc thiết kế tùy chỉnh, bán kính $r(z)$ thay đổi liên tục theo độ cao $z$. Ta chia bồn thành vô số lát cắt ngang cực mỏng dày $dz$ có diện tích $A(z) = \\pi [r(z)]^2$, sau đó dùng tích phân xác định để cộng dồn chính xác toàn bộ các lát cắt từ $z = 0$ đến $z = H$.',
    latex: 'V = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\pi [r(z_i)]^2 \\Delta z = \\pi \\int_{0}^{H} [r(z)]^2\\,dz',
  },
  {
    id: 'why_radius_squared',
    question: 'Vì sao bán kính thay đổi lại làm thể tích thay đổi rất mạnh?',
    shortSummary: 'Vì diện tích mặt cắt ngang tỉ lệ thuận với bình phương bán kính $[r(z)]^2$.',
    detailedAnswer:
      'Trong công thức $A(z) = \\pi [r(z)]^2$, bán kính $r(z)$ được bình phương. Do đó, nếu tại một độ cao nào đó bán kính tăng gấp $2$ lần thì diện tích lát cắt ngang tại đó tăng gấp $4$ lần! Chẳng hạn với bồn thành cong $r(z) = 1 + 0{,}5\\sin\\left(\\frac{\\pi z}{2}\\right)$, phần bụng giữa $z = 1\\text{ m}$ có bán kính $1{,}5\\text{ m}$ nên chứa lượng nước trên mỗi mét chiều cao gấp $2{,}25$ lần so với phần đáy $z = 0$ ($r = 1\\text{ m}$).',
    latex: 'r_2 = 2r_1 \\implies A_2 = \\pi (2r_1)^2 = 4\\pi r_1^2 = 4 A_1',
  },
  {
    id: 'why_nonlinear_level',
    question: 'Vì sao mực nước trong bồn cong hoặc nón cụt không tăng đều theo thời gian?',
    shortSummary: 'Tốc độ dâng mực nước $\\dfrac{dh}{dt}$ tỉ lệ nghịch với diện tích mặt thoáng $A(h) = \\pi [r(h)]^2$.',
    detailedAnswer:
      'Khi máy bơm hoạt động với lưu lượng không đổi $Q = \\dfrac{dV}{dt}$, theo quy tắc đạo hàm hàm hợp ta có $\\dfrac{dV}{dt} = \\dfrac{dV}{dh} \\cdot \\dfrac{dh}{dt} = A(h) \\cdot \\dfrac{dh}{dt}$. Suy ra $\\dfrac{dh}{dt} = \\dfrac{Q}{\\pi [r(h)]^2}$. Ở đoạn cổ bồn hẹp ($r$ nhỏ), tiết diện nhỏ nên nước dâng lên rất nhanh; ở đoạn thân bồn phình rộng ($r$ lớn), cùng lượng nước đó phải trải rộng trên mặt thoáng lớn nên mực nước dâng chậm lại.',
    latex: '\\frac{dh}{dt} = \\frac{Q_{\\text{vào}} - Q_{\\text{ra}}}{\\pi [r(h)]^2}',
  },
  {
    id: 'frustum_derivation',
    question: 'Công thức thể tích hình nón cụt được thiết lập từ tích phân như thế nào?',
    shortSummary: 'Viết phương trình đường thẳng đi qua $(0, r_0)$ và $(H, r_1)$ rồi lấy tích phân bình phương trên $[0, H]$.',
    detailedAnswer:
      'Đặt trục $Oz$ dọc theo tâm bồn. Tại $z = 0$ bán kính là $r_0$, tại $z = H$ bán kính là $r_1$, nên hàm bán kính là hàm bậc nhất $r(z) = r_0 + \\dfrac{r_1 - r_0}{H}z$. Thay vào công thức tích phân khối tròn xoay $\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$ và đổi biến $u = r_0 + \\dfrac{r_1 - r_0}{H}z$, ta thu được chính xác công thức quen thuộc của hình học không gian.',
    latex: 'V = \\pi \\int_{0}^{H} \\left(r_0 + \\frac{r_1 - r_0}{H}z\\right)^2 dz = \\frac{\\pi H}{3}\\left(r_0^2 + r_0 r_1 + r_1^2\\right)',
  },
  {
    id: 'material_optimization',
    question: 'Khi nào bồn chứa nước dùng ít vật liệu vỏ hơn cho cùng một dung tích?',
    shortSummary: 'Khi hình dạng bồn cân đối giữa chiều cao và đường kính (gần tỉ lệ khối trụ vuông $H = 2R$ với bồn kín).',
    detailedAnswer:
      'Nếu làm bồn quá dẹt ($R$ rất lớn, $H$ rất nhỏ) thì diện tích đáy và nắp tăng vọt; ngược lại nếu làm bồn quá cao và hẹp ($R$ rất nhỏ, $H$ rất lớn) thì diện tích thành xung quanh tăng mạnh. Với bồn trụ kín có cả đáy và nắp cố định thể tích $V$, đạo hàm diện tích toàn phần $S = 2\\pi RH + 2\\pi R^2$ đạt cực tiểu khi chiều cao bằng đường kính ($H = 2R$). Với bồn không nắp, tỉ lệ tiết kiệm nhất là $H = R$.',
    latex: 'S_{\\text{trụ kín}} = 2\\pi R H + 2\\pi R^2 = \\frac{2V}{R} + 2\\pi R^2 \\;\\xrightarrow{\\text{nhỏ nhất khi}}\\; H = 2R',
  },
];

export interface QuizQuestion {
  id: string;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
  question: string;
  latex?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// All 10+ questions verified analytically and formatted with KaTeX $...$!
export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    level: 'Nhận biết',
    question:
      'Cho hình phẳng giới hạn bởi đồ thị hàm bán kính liên tục $r(z) \\ge 0$, trục $Oz$ và hai đường thẳng $z = 0$, $z = H$ quay quanh trục $Oz$. Công thức tính thể tích khối tròn xoay tạo thành là:',
    options: [
      '$\\displaystyle V = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$',
      '$\\displaystyle V = \\int_{0}^{H} [r(z)]^2\\,dz$',
      '$\\displaystyle V = 2\\pi \\int_{0}^{H} r(z)\\,dz$',
      '$\\displaystyle V = \\pi^2 \\int_{0}^{H} [r(z)]^2\\,dz$',
    ],
    correctIndex: 0,
    explanation:
      'Theo Bài 13 – Toán 12 (Kết nối tri thức), thiết diện vuông góc trục $Oz$ tại độ cao $z \\in [0, H]$ là hình tròn diện tích $A(z) = \\pi [r(z)]^2$, nên $\\displaystyle V = \\int_{0}^{H} A(z)\\,dz = \\pi \\int_{0}^{H} [r(z)]^2\\,dz$.',
  },
  {
    id: 'q2',
    level: 'Nhận biết',
    question:
      'Một bồn nước hình trụ đứng có bán kính đáy $R = 1{,}5\\text{ m}$ và chiều cao $H = 2\\text{ m}$. Dung tích tối đa của bồn bằng bao nhiêu (làm tròn đến chữ số thập phân thứ hai)?',
    options: [
      '$14{,}14\\text{ m}^3$',
      '$9{,}42\\text{ m}^3$',
      '$18{,}85\\text{ m}^3$',
      '$4{,}50\\text{ m}^3$',
    ],
    correctIndex: 0,
    explanation:
      'Áp dụng công thức $V = \\pi R^2 H = \\pi \\cdot 1{,}5^2 \\cdot 2 = 4{,}5\\pi \\approx 14{,}1372\\text{ m}^3 \\approx 14{,}14\\text{ m}^3$.',
  },
  {
    id: 'q3',
    level: 'Thông hiểu',
    question:
      'Một bồn nước hình nón cụt có bán kính đáy $r_0 = 1\\text{ m}$, bán kính miệng trên $r_1 = 2\\text{ m}$ và chiều cao $H = 3\\text{ m}$. Thể tích toàn bồn là:',
    options: [
      '$7\\pi \\approx 21{,}99\\text{ m}^3$',
      '$9\\pi \\approx 28{,}27\\text{ m}^3$',
      '$5\\pi \\approx 15{,}71\\text{ m}^3$',
      '$21\\pi \\approx 65{,}97\\text{ m}^3$',
    ],
    correctIndex: 0,
    explanation:
      'Theo công thức nón cụt $\\displaystyle V = \\frac{\\pi H}{3}\\left(r_0^2 + r_0 r_1 + r_1^2\\right) = \\frac{\\pi \\cdot 3}{3}(1 + 2 + 4) = 7\\pi \\approx 21{,}991\\text{ m}^3$.',
  },
  {
    id: 'q4',
    level: 'Thông hiểu',
    question:
      'Một bồn chứa dạng bán cầu có hàm bán kính $r(z) = \\sqrt{4 - z^2}$ với $0 \\le z \\le 2$ (đơn vị: mét). Biểu thức tích phân tính dung tích toàn bồn là:',
    options: [
      '$\\displaystyle V = \\pi \\int_{0}^{2} (4 - z^2)\\,dz = \\frac{16\\pi}{3}\\text{ m}^3$',
      '$\\displaystyle V = \\pi \\int_{0}^{2} \\sqrt{4 - z^2}\\,dz = \\pi^2\\text{ m}^3$',
      '$\\displaystyle V = \\int_{0}^{2} (4 - z^2)\\,dz = \\frac{16}{3}\\text{ m}^3$',
      '$\\displaystyle V = 2\\pi \\int_{0}^{2} (4 - z^2)\\,dz = \\frac{32\\pi}{3}\\text{ m}^3$',
    ],
    correctIndex: 0,
    explanation:
      'Bình phương bán kính cho $[r(z)]^2 = 4 - z^2$. Khi đó $\\displaystyle V = \\pi \\int_{0}^{2} (4 - z^2)\\,dz = \\pi \\left[4z - \\frac{z^3}{3}\\right]_{0}^{2} = \\pi\\left(8 - \\frac{8}{3}\\right) = \\frac{16\\pi}{3}\\text{ m}^3$.',
  },
  {
    id: 'q5',
    level: 'Vận dụng',
    question:
      'Bồn thành cong có hàm bán kính $r(z) = 1 + 0{,}5\\sin\\left(\\dfrac{\\pi z}{2}\\right)$ trên đoạn $0 \\le z \\le 2$ ($\\text{m}$). Thể tích toàn bồn gần nhất với giá trị nào sau đây?',
    options: [
      '$11{,}07\\text{ m}^3$',
      '$6{,}28\\text{ m}^3$',
      '$14{,}14\\text{ m}^3$',
      '$8{,}54\\text{ m}^3$',
    ],
    correctIndex: 0,
    explanation:
      'Tính $\\displaystyle V = \\pi \\int_{0}^{2} \\left[1 + \\sin\\left(\\frac{\\pi z}{2}\\right) + 0{,}25\\sin^2\\left(\\frac{\\pi z}{2}\\right)\\right] dz = \\pi\\left(2 + \\frac{4}{\\pi} + 0{,}25\\right) = 2{,}25\\pi + 4 \\approx 11{,}0686\\text{ m}^3 \\approx 11{,}07\\text{ m}^3$.',
  },
  {
    id: 'q6',
    level: 'Thông hiểu',
    question:
      'Phát biểu nào sau đây phân biệt ĐÚNG giữa dung tích toàn bồn $V_{\\max}$ và thể tích nước hiện có $V_{\\text{water}}(h)$ khi mực nước ở độ cao $h$ ($0 < h < H$)?',
    options: [
      '$V_{\\max}$ lấy tích phân từ $0$ đến $H$; còn $V_{\\text{water}}(h)$ lấy tích phân từ $0$ đến $h$ trên cùng hàm diện tích $\\pi [r(z)]^2$.',
      'Luôn có $V_{\\text{water}}(h) = \\dfrac{h}{H} \\cdot V_{\\max}$ với mọi hình dạng bồn bất kỳ.',
      '$V_{\\text{water}}(h)$ lấy tích phân từ $h$ đến $H$ của hàm $\\pi [r(z)]^2$.',
      '$V_{\\max}$ và $V_{\\text{water}}(h)$ chỉ khác nhau hệ số hằng số $\\pi$.',
    ],
    correctIndex: 0,
    explanation:
      'Nước chiếm phần lòng bồn từ đáy $z = 0$ đến mặt thoáng $z = h$ nên $\\displaystyle V_{\\text{water}}(h) = \\pi \\int_{0}^{h} [r(z)]^2\\,dz$. Công thức tỉ lệ tuyến tính $\\dfrac{h}{H} \\cdot V_{\\max}$ chỉ đúng khi tiết diện không đổi (hình trụ).',
  },
  {
    id: 'q7',
    level: 'Nhận biết',
    question:
      'Nếu thể tích nước trong bồn tính được từ tích phân là $V_{\\text{water}} = 3{,}25\\text{ m}^3$ thì lượng nước đó tương ứng bao nhiêu lít?',
    options: [
      '$3.250\\text{ lít}$',
      '$325\\text{ lít}$',
      '$32.500\\text{ lít}$',
      '$3{,}25\\text{ lít}$',
    ],
    correctIndex: 0,
    explanation:
      'Quy đổi đơn vị chuẩn: $1\\text{ m}^3 = 1.000\\text{ dm}^3 = 1.000\\text{ lít}$. Vậy $3{,}25\\text{ m}^3 = 3{,}25 \\times 1.000 = 3.250\\text{ lít}$.',
  },
  {
    id: 'q8',
    level: 'Thông hiểu',
    question:
      'Một bồn hình trụ $R = 1\\text{ m}$, $H = 2\\text{ m}$ ban đầu rỗng. Bơm nước vào với lưu lượng $Q_v = 0{,}6\\text{ m}^3/\\text{phút}$ đồng thời xả ra $Q_r = 0{,}1\\text{ m}^3/\\text{phút}$. Sau $6\\text{ phút}$ thể tích nước và chiều cao mực nước là:',
    options: [
      '$V_{\\text{water}} = 3{,}00\\text{ m}^3$ và $h = \\dfrac{3}{\\pi} \\approx 0{,}95\\text{ m}$',
      '$V_{\\text{water}} = 3{,}60\\text{ m}^3$ và $h \\approx 1{,}15\\text{ m}$',
      '$V_{\\text{water}} = 3{,}00\\text{ m}^3$ và $h = 1{,}50\\text{ m}$',
      '$V_{\\text{water}} = 4{,}20\\text{ m}^3$ và $h \\approx 1{,}34\\text{ m}$',
    ],
    correctIndex: 0,
    explanation:
      'Lưu lượng ròng $Q = Q_v - Q_r = 0{,}6 - 0{,}1 = 0{,}5\\text{ m}^3/\\text{phút}$. Sau $6\\text{ phút}$: $V_{\\text{water}} = 0{,}5 \\times 6 = 3\\text{ m}^3$. Với hình trụ $R = 1\\text{ m}$: $h = \\dfrac{V_{\\text{water}}}{\\pi R^2} = \\dfrac{3}{\\pi} \\approx 0{,}9549\\text{ m}$.',
  },
  {
    id: 'q9',
    level: 'Vận dụng',
    question:
      'Bơm nước với lưu lượng không đổi vào một bồn hình nón cụt loe dần lên trên ($r_0 = 0{,}8\\text{ m}$ ở đáy, $r_1 = 1{,}8\\text{ m}$ ở miệng). Khi mực nước dâng từ đáy lên miệng thì tốc độ tăng mực nước $\\dfrac{dh}{dt}$ biến đổi thế nào?',
    options: [
      'Giảm dần vì diện tích mặt thoáng $\\pi [r(h)]^2$ ngày càng lớn.',
      'Tăng dần vì càng lên cao áp suất càng lớn.',
      'Không đổi vì lưu lượng máy bơm không đổi.',
      'Tăng lên cực đại ở giữa bồn rồi giảm.',
    ],
    correctIndex: 0,
    explanation:
      'Do $\\dfrac{dh}{dt} = \\dfrac{Q}{\\pi [r(h)]^2}$, khi $h$ tăng thì bán kính $r(h)$ tăng từ $0{,}8\\text{ m}$ lên $1{,}8\\text{ m}$ làm mẫu số tăng, nên tốc độ dâng mực nước $\\dfrac{dh}{dt}$ giảm dần.',
  },
  {
    id: 'q10',
    level: 'Vận dụng',
    question:
      'Cần chế tạo bồn hình trụ kín (có cả đáy và nắp) dung tích $V = 2\\pi\\text{ m}^3$ với $S_{\\text{toàn phần}} = 2\\pi RH + 2\\pi R^2$. So sánh Phương án A ($R = 1\\text{ m},\\; H = 2\\text{ m}$) và Phương án B ($R = \\sqrt{2}\\text{ m},\\; H = 1\\text{ m}$), phương án nào tốn ít diện tích vật liệu vỏ hơn?',
    options: [
      'Phương án A tốn ít vật liệu hơn ($6\\pi \\approx 18{,}85\\text{ m}^2$ so với $(4 + 2\\sqrt{2})\\pi \\approx 21{,}45\\text{ m}^2$).',
      'Phương án B tốn ít vật liệu hơn vì chiều cao thấp hơn một nửa.',
      'Hai phương án có diện tích toàn phần bằng nhau vì cùng thể tích.',
      'Phương án A tốn nhiều vật liệu hơn ($8\\pi\\text{ m}^2$ so với $6\\pi\\text{ m}^2$).',
    ],
    correctIndex: 0,
    explanation:
      'Phương án A ($H = 2R$): $S_A = 2\\pi(1)(2) + 2\\pi(1)^2 = 6\\pi \\approx 18{,}85\\text{ m}^2$. Phương án B: $S_B = 2\\pi(\\sqrt{2})(1) + 2\\pi(2) = (4 + 2\\sqrt{2})\\pi \\approx 21{,}45\\text{ m}^2$. Phương án A tiết kiệm hơn khoảng $2{,}60\\text{ m}^2$ vật liệu!',
  },
];
