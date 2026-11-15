import {
  AIToolEvaluation,
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
    deliverable: 'Bản thiết kế phác thảo và danh sách yêu cầu chức năng bàn giao cho Nhóm 2.',
  },
  {
    id: 2,
    title: 'Nhóm 2 – Viết Prompt & Tạo ứng dụng bằng Gemini',
    studentRange: 'HS11–HS20',
    objectives: [
      'Chuyển hóa bản yêu cầu của Nhóm 1 thành prompt kỹ thuật có cấu trúc.',
      'Sử dụng Gemini trong Google AI Studio để sinh mã giao diện, mô hình 3D và động cơ tích phân.',
      'Chạy thử bản xem trước, đối chiếu công thức và tinh chỉnh prompt qua từng vòng.',
    ],
    deliverable: 'Prompt v1, Prompt đã hiệu chỉnh và bản ứng dụng demo hoạt động.',
  },
  {
    id: 3,
    title: 'Nhóm 3 – Khảo sát & So sánh công cụ AI',
    studentRange: 'HS21–HS30',
    objectives: [
      'Khảo sát thực nghiệm 3 công cụ: Google AI Studio (Gemini), Base44 và Google Antigravity.',
      'Thử nghiệm cùng bài toán chuẩn: dựng bồn trụ 3D chỉnh R, H và tính V = πR²H.',
      'Chấm điểm theo bộ 8 tiêu chí có minh chứng cụ thể, không suy đoán cảm tính.',
    ],
    deliverable: 'Bảng đánh giá đối sánh có minh chứng và đề xuất lựa chọn công cụ phù hợp cho THPT.',
  },
  {
    id: 4,
    title: 'Nhóm 4 – Tổng hợp, Kiểm thử & Hoàn thiện',
    studentRange: 'HS31–HS40',
    objectives: [
      'Tiếp nhận kết quả từ ba nhóm, hợp nhất nội dung và cấu hình hệ thống.',
      'Đối chiếu 12 ca kiểm thử Toán học, bơm – xả, diện tích bề mặt và hiển thị di động.',
      'Hoàn thiện hồ sơ dự án và tổ chức báo cáo trình diễn trước lớp / Ban Giám khảo.',
    ],
    deliverable: 'Website SMART WATER TANK 3D hoàn chỉnh kèm biên bản kiểm thử.',
  },
];

export const INITIAL_STUDENTS: StudentAssignment[] = [
  // NHÓM 1: HS01 - HS10
  { code: 'HS01', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Điều phối và chốt yêu cầu', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS02', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Ghi chép ý tưởng', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS03', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Nghiên cứu vấn đề thực tế', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS04', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Liệt kê chức năng', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS05', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Phác thảo trang chủ', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS06', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Phác thảo các dạng bồn', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS07', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Kiểm tra công thức hình trụ, nón cụt', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS08', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Nghiên cứu mực nước và lưu lượng', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS09', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Đề xuất đồ thị và bài tập', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS10', groupId: 1, groupName: 'Nhóm 1 – Xây dựng ý tưởng', task: 'Trình bày và bàn giao ý tưởng', status: 'not_started', evidence: '', note: '', reviewer: '' },

  // NHÓM 2: HS11 - HS20
  { code: 'HS11', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Tổng hợp prompt', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS12', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Viết yêu cầu giao diện', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS13', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Viết yêu cầu mô hình 3D', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS14', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Viết yêu cầu tính tích phân', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS15', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Xây dựng bồn hình trụ và nón cụt', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS16', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Xây dựng bồn thành cong', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS17', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Mô phỏng bơm – xả', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS18', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Đồ thị và bài tập', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS19', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Kiểm thử prompt, ghi lỗi', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS20', groupId: 2, groupName: 'Nhóm 2 – Viết prompt & Gemini', task: 'Trình diễn và bàn giao bản demo', status: 'not_started', evidence: '', note: '', reviewer: '' },

  // NHÓM 3: HS21 - HS30
  { code: 'HS21', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Xây dựng tiêu chí', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS22', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Thử Google AI Studio', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS23', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Thử Base44', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS24', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Tìm hiểu Antigravity', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS25', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Kiểm tra khả năng 3D', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS26', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'So sánh khả năng tính toán', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS27', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Tìm hiểu giới hạn sử dụng', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS28', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Tìm hiểu lưu trữ, xuất bản', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS29', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Tổng hợp ưu và nhược điểm', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS30', groupId: 3, groupName: 'Nhóm 3 – So sánh công cụ AI', task: 'Báo cáo đề xuất', status: 'not_started', evidence: '', note: '', reviewer: '' },

  // NHÓM 4: HS31 - HS40
  { code: 'HS31', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Điều phối công việc cuối', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS32', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Tổng hợp hồ sơ', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS33', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Hoàn thiện giao diện', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS34', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Kiểm tra hình trụ và nón cụt', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS35', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Kiểm tra bồn cong', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS36', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Kiểm tra bơm – xả', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS37', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Kiểm tra xoay và zoom', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS38', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Kiểm thử điện thoại', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS39', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Ghi lỗi và kiểm thử lại', status: 'not_started', evidence: '', note: '', reviewer: '' },
  { code: 'HS40', groupId: 4, groupName: 'Nhóm 4 – Kiểm thử & Hoàn thiện', task: 'Trình bày sản phẩm', status: 'not_started', evidence: '', note: '', reviewer: '' },
];

export interface AIJudgeCriterion {
  id: string;
  label: string;
  weightFactor: number; // Allows 8 criteria each scored 0-2 (raw max 16) scaled cleanly to 10-point scale: (sum / 16) * 10, OR explicit weights summing to 10!
  description: string;
}

export const AI_TOOL_CRITERIA: AIJudgeCriterion[] = [
  { id: 'ease', label: '1. Dễ sử dụng', weightFactor: 1.25, description: 'Giao diện trực quan, dễ bắt đầu với học sinh THPT (0–2 điểm).' },
  { id: 'ui', label: '2. Tạo giao diện', weightFactor: 1.25, description: 'Khả năng sinh bố cục tiếng Việt rõ ràng, đáp ứng nhiều màn hình (0–2 điểm).' },
  { id: 'model3d', label: '3. Khả năng xây dựng 3D', weightFactor: 1.25, description: 'Dựng hình khối Three.js tương tác xoay/thu phóng thực (0–2 điểm).' },
  { id: 'math', label: '4. Tính đúng công thức', weightFactor: 1.25, description: 'Tính chính xác tích phân V = π∫[r(z)]²dz, không gán số giả (0–2 điểm).' },
  { id: 'edit', label: '5. Khả năng chỉnh sửa', weightFactor: 1.25, description: 'Cho phép cập nhật từng phần mã hoặc tinh chỉnh bằng prompt tiếp nối (0–2 điểm).' },
  { id: 'deploy', label: '6. Xuất mã và triển khai', weightFactor: 1.25, description: 'Tải mã nguồn ZIP/GitHub và build lên Vercel/Netlify (0–2 điểm).' },
  { id: 'access', label: '7. Điều kiện sử dụng', weightFactor: 1.25, description: 'Chi phí, tài khoản và giới hạn lượt dùng miễn phí (0–2 điểm).' },
  { id: 'highschool', label: '8. Phù hợp học sinh THPT', weightFactor: 1.25, description: 'Hỗ trợ học tập kiểm chứng Toán học và làm việc nhóm (0–2 điểm).' },
];

// Strictly initialized with null scores and tested=false so no unverified ratings are fabricated!
export const INITIAL_AI_EVALUATIONS: AIToolEvaluation[] = [
  {
    toolId: 'aistudio_gemini',
    toolName: 'Google AI Studio (Gemini)',
    tested: false,
    scores: {
      ease: null,
      ui: null,
      model3d: null,
      math: null,
      edit: null,
      deploy: null,
      access: null,
      highschool: null,
    },
    evidence: '',
    pros: '',
    cons: '',
  },
  {
    toolId: 'base44',
    toolName: 'Base44',
    tested: false,
    scores: {
      ease: null,
      ui: null,
      model3d: null,
      math: null,
      edit: null,
      deploy: null,
      access: null,
      highschool: null,
    },
    evidence: '',
    pros: '',
    cons: '',
  },
  {
    toolId: 'antigravity',
    toolName: 'Google Antigravity',
    tested: false,
    scores: {
      ease: null,
      ui: null,
      model3d: null,
      math: null,
      edit: null,
      deploy: null,
      access: null,
      highschool: null,
    },
    evidence: '',
    pros: '',
    cons: '',
  },
];

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
      'Xác định câu hỏi: Làm sao đo lượng nước trong bồn cong chỉ từ chiều cao mực nước h?',
    ],
    deliverable: 'Phiếu khảo sát thực tế và danh mục bài toán cần giải quyết.',
    criteria: 'Nêu rõ tối thiểu 3 dạng hình học bồn và các đại lượng đo đạc (R, H, h, Q).',
  },
  {
    step: 2,
    title: 'Phác thảo ý tưởng',
    goal: 'Thiết kế luồng màn hình, mô hình toán học tích phân và sơ đồ chức năng ứng dụng.',
    owner: 'Nhóm 1 (HS05–HS10)',
    tasks: [
      'Phác thảo 6 phòng chức năng của website.',
      'Thiết lập công thức chuẩn cho bồn trụ, nón cụt, thành cong và bán cầu.',
    ],
    deliverable: 'Wireframe giao diện và bảng công thức chuẩn đối chiếu.',
    criteria: 'Đầy đủ 6 khu vực và công thức V = π∫₀ᴴ[r(z)]²dz kèm điều kiện miền xác định.',
  },
  {
    step: 3,
    title: 'Viết prompt Gemini',
    goal: 'Chuyển hóa thiết kế sư phạm thành đặc tả kỹ thuật rõ ràng cho mô hình AI.',
    owner: 'Nhóm 2 (HS11–HS14)',
    tasks: [
      'Phân tách prompt thành các mục: Vai trò, Công nghệ, 3D, Động cơ tích phân, Kiểm thử.',
      'Ràng buộc rõ yêu cầu không gán số giả và không dùng h = H·V/Vmax cho bồn cong.',
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
      'Chạy bài toán chuẩn tạo bồn trụ 3D (chỉnh R, H, tính V = πR²H) trên các công cụ.',
      'Ghi lại ảnh chụp màn hình/liên kết minh chứng và chấm điểm từng tiêu chí 0–2.',
    ],
    deliverable: 'Bảng đối sánh 3 công cụ AI quy đổi thang 10 điểm.',
    criteria: 'Mỗi điểm số đều kèm ghi chú thực nghiệm trung thực, không tự điền khi chưa thử.',
  },
  {
    step: 5,
    title: 'Tạo ứng dụng',
    goal: 'Xây dựng và kết nối đầy đủ mô hình 3D, động cơ tích phân, mô phỏng bơm – xả và đồ thị.',
    owner: 'Nhóm 2 (HS15–HS20)',
    tasks: [
      'Dựng hình khối tròn xoay bằng LatheGeometry từ hàm r(z).',
      'Lập trình giải phương trình tìm mực nước h bằng phương pháp chia đôi.',
    ],
    deliverable: 'Bản ứng dụng chạy thực tế trong trình duyệt.',
    criteria: 'Thay đổi thanh trượt cập nhật tức thời cả mô hình 3D, lời giải KaTeX và 4 đồ thị.',
  },
  {
    step: 6,
    title: 'Kiểm thử',
    goal: 'Xác minh độ chính xác Toán học, giới hạn vật lý và khả năng hiển thị đa thiết bị.',
    owner: 'Nhóm 4 (HS31–HS39)',
    tasks: [
      'Chạy 12 ca kiểm thử chuẩn (sai số thể tích < 0,001 m³).',
      'Kiểm tra trường hợp tràn bồn, cạn bồn, nhập số âm và màn hình điện thoại.',
    ],
    deliverable: 'Biên bản kiểm thử 12 test cases và danh sách lỗi đã khắc phục.',
    criteria: 'Đạt 12/12 bài kiểm thử chuẩn, không phát sinh lỗi console.',
  },
  {
    step: 7,
    title: 'Trình diễn',
    goal: 'Báo cáo kết quả dự án STEM trước lớp và giáo viên phụ trách Lê Văn Mạnh.',
    owner: 'Nhóm 4 (HS40) & Đại diện 4 nhóm',
    tasks: [
      'Trình diễn trực tiếp chuỗi: Hàm số → Đồ thị → Tích phân → Khối 3D → Mực nước → Tối ưu.',
      'Tổng hợp điểm đánh giá dự án và rút kinh nghiệm sử dụng AI có kiểm chứng.',
    ],
    deliverable: 'Bài thuyết trình tổng kết và sản phẩm SMART WATER TANK 3D hoàn chỉnh.',
    criteria: 'Giải thích mạch lạc bản chất tích phân và trả lời được câu hỏi phản biện.',
  },
];

export const INITIAL_VERSION_LOG: VersionLogItem[] = [
  {
    id: 'v_idea_1',
    versionName: 'Ý tưởng v1',
    description: 'Xác định bài toán thực tế, chọn 4 loại bồn nước và bộ công thức Bài 13 Toán 12.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
  {
    id: 'v_prompt_1',
    versionName: 'Prompt v1',
    description: 'Bản đặc tả đầu tiên gửi vào Gemini trên Google AI Studio để sinh khung ứng dụng.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
  {
    id: 'v_demo_1',
    versionName: 'Demo v1',
    description: 'Hoàn thành mô hình bồn trụ, nón cụt 3D và phép tính tích phân cơ bản.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
  {
    id: 'v_demo_2',
    versionName: 'Demo v2',
    description: 'Bổ sung bồn thành cong, hàm tùy chỉnh math.js, phòng bơm – xả và 4 đồ thị tương tác.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
  {
    id: 'v_test',
    versionName: 'Bản kiểm thử',
    description: 'Tích hợp 12 ca kiểm thử tự động, tối ưu thiết kế A/B và kiểm tra giao diện di động.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
  {
    id: 'v_final',
    versionName: 'Bản hoàn chỉnh',
    description: 'Hoàn thiện không gian 40 học sinh, bảng đánh giá giáo viên và sẵn sàng báo cáo STEM.',
    confirmed: false,
    confirmedBy: '',
    updatedAt: '',
  },
];

export const INITIAL_TEACHER_RUBRIC: TeacherRubricState = {
  mathAccuracy: 0,
  model3D: 0,
  geminiPrompt: 0,
  aiComparison: 0,
  teamCollaboration: 0,
  presentation: 0,
  teacherComment: '',
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
    definitionVi: 'Lượng không gian ba chiều mà bồn hoặc khối nước chiếm chỗ, đo bằng m³ hoặc lít.',
  },
  {
    en: 'Integral',
    vi: 'Tích phân',
    phonetic: '/ˈɪntɪɡrəl/',
    definitionVi: 'Phép toán giải tích cộng dồn vô hạn các lát cắt vi phân A(z)dz để tính thể tích chính xác.',
  },
  {
    en: 'Radius',
    vi: 'Bán kính',
    phonetic: '/ˈreɪdiəs/',
    definitionVi: 'Khoảng cách từ trục đối xứng Oz đến thành bồn tại độ cao z, ký hiệu r(z).',
  },
  {
    en: 'Height',
    vi: 'Chiều cao',
    phonetic: '/haɪt/',
    definitionVi: 'Khoảng cách thẳng đứng từ đáy bồn z = 0 đến đỉnh bồn z = H.',
  },
  {
    en: 'Water Level',
    vi: 'Mực nước',
    phonetic: '/ˈwɔːtər ˈlevəl/',
    definitionVi: 'Độ cao mặt thoáng nằm ngang h (m) của lượng nước hiện có trong bồn.',
  },
  {
    en: 'Flow Rate',
    vi: 'Lưu lượng',
    phonetic: '/fləʊ reɪt/',
    definitionVi: 'Thể tích nước bơm vào (Qv) hoặc xả ra (Qr) trên một đơn vị thời gian (m³/phút hoặc lít/phút).',
  },
  {
    en: 'Cylinder',
    vi: 'Hình trụ',
    phonetic: '/ˈsɪlɪndər/',
    definitionVi: 'Khối tròn xoay có bán kính mặt cắt ngang không đổi r(z) = R.',
  },
  {
    en: 'Frustum',
    vi: 'Hình nón cụt',
    phonetic: '/ˈfrʌstəm/',
    definitionVi: 'Khối tròn xoay có bán kính biến thiên bậc nhất từ đáy r₀ đến miệng r₁.',
  },
  {
    en: 'Surface Area',
    vi: 'Diện tích bề mặt',
    phonetic: '/ˈsɜːfɪs ˈeəriə/',
    definitionVi: 'Tổng diện tích vỏ thành, đáy và nắp bồn, quyết định lượng vật liệu chế tạo.',
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
    definitionVi: 'Biểu diễn trực quan vật thể trong không gian Oxyz cho phép xoay, cắt lớp và quan sát.',
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
    shortSummary: 'Vì khi bán kính r(z) thay đổi theo chiều cao, các công thức hình học sơ cấp không còn áp dụng trực tiếp được.',
    detailedAnswer:
      'Với bồn hình trụ, tiết diện ngang không đổi nên chỉ cần lấy diện tích đáy nhân chiều cao. Tuy nhiên với bồn thành cong, bồn cầu hoặc thiết kế tùy chỉnh, bán kính r(z) thay đổi liên tục theo độ cao z. Ta chia bồn thành vô số lát cắt ngang cực mỏng dày dz có diện tích A(z) = π[r(z)]², sau đó dùng tích phân xác định để cộng dồn chính xác toàn bộ các lát cắt từ z = 0 đến z = H.',
    latex: 'V = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\pi [r(z_i)]^2 \\Delta z = \\pi \\int_{0}^{H} [r(z)]^2\\,dz',
  },
  {
    id: 'why_radius_squared',
    question: 'Vì sao bán kính thay đổi lại làm thể tích thay đổi rất mạnh?',
    shortSummary: 'Vì diện tích mặt cắt ngang tỉ lệ thuận với bình phương bán kính [r(z)]².',
    detailedAnswer:
      'Trong công thức A(z) = π[r(z)]², bán kính r(z) được bình phương. Do đó, nếu tại một độ cao nào đó bán kính tăng gấp 2 lần thì diện tích lát cắt ngang tại đó tăng gấp 4 lần! Chẳng hạn với bồn thành cong r(z) = 1 + 0,5sin(πz/2), phần bụng giữa z = 1 m có bán kính 1,5 m nên chứa lượng nước trên mỗi mét chiều cao gấp 2,25 lần so với phần đáy z = 0 (r = 1 m).',
    latex: 'r_2 = 2r_1 \\implies A_2 = \\pi (2r_1)^2 = 4\\pi r_1^2 = 4 A_1',
  },
  {
    id: 'why_nonlinear_level',
    question: 'Vì sao mực nước trong bồn cong hoặc nón cụt không tăng đều theo thời gian?',
    shortSummary: 'Tốc độ dâng mực nước dh/dt tỉ lệ nghịch với diện tích mặt thoáng A(h) = π[r(h)]².',
    detailedAnswer:
      'Khi máy bơm hoạt động với lưu lượng không đổi Q = dV/dt, theo quy tắc đạo hàm hàm hợp ta có dV/dt = (dV/dh)·(dh/dt) = A(h)·(dh/dt). Suy ra dh/dt = Q / [πr(h)²]. Ở đoạn cổ bồn hẹp (r nhỏ), tiết diện nhỏ nên nước dâng lên rất nhanh; ở đoạn thân bồn phình rộng (r lớn), cùng lượng nước đó phải trải rộng trên mặt thoáng lớn nên mực nước dâng chậm lại.',
    latex: '\\frac{dh}{dt} = \\frac{Q_{\\text{vào}} - Q_{\\text{ra}}}{\\pi [r(h)]^2}',
  },
  {
    id: 'frustum_derivation',
    question: 'Công thức thể tích hình nón cụt được thiết lập từ tích phân như thế nào?',
    shortSummary: 'Viết phương trình đường thẳng đi qua (0, r₀) và (H, r₁) rồi lấy tích phân bình phương trên [0, H].',
    detailedAnswer:
      'Đặt trục Oz dọc theo tâm bồn. Tại z = 0 bán kính là r₀, tại z = H bán kính là r₁, nên hàm bán kính là hàm bậc nhất r(z) = r₀ + ((r₁ − r₀)/H)z. Thay vào công thức tích phân khối tròn xoay V = π∫₀ᴴ[r(z)]²dz và đổi biến u = r₀ + ((r₁ − r₀)/H)z, ta thu được chính xác công thức quen thuộc của hình học không gian.',
    latex: 'V = \\pi \\int_{0}^{H} \\left(r_0 + \\frac{r_1 - r_0}{H}z\\right)^2 dz = \\frac{\\pi H}{3}\\left(r_0^2 + r_0 r_1 + r_1^2\\right)',
  },
  {
    id: 'material_optimization',
    question: 'Khi nào bồn chứa nước dùng ít vật liệu vỏ hơn cho cùng một dung tích?',
    shortSummary: 'Khi hình dạng bồn cân đối giữa chiều cao và đường kính (gần tỉ lệ khối cầu/trụ vuông H = 2R với bồn kín).',
    detailedAnswer:
      'Nếu làm bồn quá dẹt (R rất lớn, H rất nhỏ) thì diện tích đáy và nắp tăng vọt; ngược lại nếu làm bồn quá cao và ốm (R rất nhỏ, H rất lớn) thì diện tích thành xung quanh tăng mạnh. Với bồn trụ kín có cả đáy và nắp cố định thể tích V, đạo hàm diện tích toàn phần S = 2πRH + 2πR² đạt cực tiểu khi chiều cao bằng đường kính (H = 2R). Với bồn không nắp, tỉ lệ tiết kiệm nhất là H = R.',
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

// All 10+ questions verified analytically!
export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    level: 'Nhận biết',
    question:
      'Cho hình phẳng giới hạn bởi đồ thị hàm bán kính liên tục r(z) ≥ 0, trục Oz và hai đường thẳng z = 0, z = H quay quanh trục Oz. Công thức tính thể tích khối tròn xoay tạo thành là:',
    latex: '0 \\le z \\le H',
    options: [
      'V = π ∫₀ᴴ [r(z)]² dz',
      'V = ∫₀ᴴ [r(z)]² dz',
      'V = 2π ∫₀ᴴ r(z) dz',
      'V = π² ∫₀ᴴ [r(z)]² dz',
    ],
    correctIndex: 0,
    explanation:
      'Theo Bài 13 – Toán 12 (Kết nối tri thức), thiết diện vuông góc trục Oz tại độ cao z là hình tròn diện tích A(z) = π[r(z)]², nên V = ∫₀ᴴ A(z)dz = π∫₀ᴴ[r(z)]²dz.',
  },
  {
    id: 'q2',
    level: 'Nhận biết',
    question:
      'Một bồn nước hình trụ đứng có bán kính đáy R = 1,5 m và chiều cao H = 2 m. Dung tích tối đa của bồn bằng bao nhiêu (làm tròn đến chữ số thập phân thứ hai)?',
    latex: 'R = 1{,}5\\text{ m}, \\quad H = 2\\text{ m}',
    options: ['14,14 m³', '9,42 m³', '18,85 m³', '4,50 m³'],
    correctIndex: 0,
    explanation: 'Áp dụng V = πR²H = π · 1,5² · 2 = 4,5π ≈ 14,1372 m³ ≈ 14,14 m³.',
  },
  {
    id: 'q3',
    level: 'Thông hiểu',
    question:
      'Một bồn nước hình nón cụt có bán kính đáy r₀ = 1 m, bán kính miệng trên r₁ = 2 m và chiều cao H = 3 m. Thể tích toàn bồn là:',
    latex: 'r_0 = 1\\text{ m},\\; r_1 = 2\\text{ m},\\; H = 3\\text{ m}',
    options: ['7π ≈ 21,99 m³', '9π ≈ 28,27 m³', '5π ≈ 15,71 m³', '21π ≈ 65,97 m³'],
    correctIndex: 0,
    explanation:
      'Theo công thức nón cụt V = πH(r₀² + r₀r₁ + r₁²)/3 = π·3·(1 + 2 + 4)/3 = 7π ≈ 21,991 m³.',
  },
  {
    id: 'q4',
    level: 'Thông hiểu',
    question:
      'Một bồn chứa dạng bán cầu có hàm bán kính r(z) = √(4 − z²) với 0 ≤ z ≤ 2 (đơn vị: mét). Biểu thức tích phân tính dung tích toàn bồn là:',
    latex: 'r(z) = \\sqrt{4 - z^2}, \\quad 0 \\le z \\le 2',
    options: [
      'V = π ∫₀² (4 − z²) dz = 16π/3 m³',
      'V = π ∫₀² √(4 − z²) dz = π² m³',
      'V = ∫₀² (4 − z²) dz = 16/3 m³',
      'V = 2π ∫₀² (4 − z²) dz = 32π/3 m³',
    ],
    correctIndex: 0,
    explanation:
      'Bình phương bán kính cho [r(z)]² = 4 − z². Khi đó V = π∫₀²(4 − z²)dz = π[4z − z³/3]₀² = π(8 − 8/3) = 16π/3 m³.',
  },
  {
    id: 'q5',
    level: 'Vận dụng',
    question:
      'Bồn thành cong có hàm bán kính r(z) = 1 + 0,5sin(πz/2) trên đoạn 0 ≤ z ≤ 2 (m). Thể tích toàn bồn gần nhất với giá trị nào sau đây?',
    latex: 'r(z) = 1 + 0{,}5\\sin\\left(\\frac{\\pi z}{2}\\right), \\quad H = 2\\text{ m}',
    options: ['11,07 m³', '6,28 m³', '14,14 m³', '8,54 m³'],
    correctIndex: 0,
    explanation:
      'Tính V = π∫₀²[1 + sin(πz/2) + 0,25sin²(πz/2)]dz = π(2 + 4/π + 0,25) = 2,25π + 4 ≈ 11,0686 m³ ≈ 11,07 m³.',
  },
  {
    id: 'q6',
    level: 'Thông hiểu',
    question:
      'Phát biểu nào sau đây phân biệt ĐÚNG giữa dung tích toàn bồn Vmax và thể tích nước hiện có Vwater(h) khi mực nước ở độ cao h (0 < h < H)?',
    options: [
      'Vmax tích phân từ 0 đến H; còn Vwater(h) tích phân từ 0 đến h trên cùng hàm diện tích π[r(z)]².',
      'Luôn có Vwater(h) = (h / H) · Vmax với mọi hình dạng bồn bất kỳ.',
      'Vwater(h) tích phân từ h đến H của hàm π[r(z)]².',
      'Vmax và Vwater(h) chỉ khác nhau hệ số hằng số π.',
    ],
    correctIndex: 0,
    explanation:
      'Nước chiếm phần lòng bồn từ đáy z = 0 đến mặt thoáng z = h nên Vwater(h) = π∫₀ʰ[r(z)]²dz. Công thức tỉ lệ tuyến tính (h/H)·Vmax chỉ đúng khi tiết diện không đổi (hình trụ).',
  },
  {
    id: 'q7',
    level: 'Nhận biết',
    question:
      'Nếu thể tích nước trong bồn tính được từ tích phân là Vwater = 3,25 m³ thì lượng nước đó tương ứng bao nhiêu lít?',
    options: ['3.250 lít', '325 lít', '32.500 lít', '3,25 lít'],
    correctIndex: 0,
    explanation: 'Quy đổi đơn vị chuẩn: 1 m³ = 1.000 dm³ = 1.000 lít. Vậy 3,25 m³ = 3,25 × 1.000 = 3.250 lít.',
  },
  {
    id: 'q8',
    level: 'Thông hiểu',
    question:
      'Một bồn hình trụ R = 1 m, H = 2 m ban đầu rỗng. Bơm nước vào với lưu lượng Qv = 0,6 m³/phút đồng thời xả ra Qr = 0,1 m³/phút. Sau 6 phút thể tích nước và chiều cao mực nước là:',
    latex: 'Q_v = 0{,}6,\\; Q_r = 0{,}1\\text{ (m}^3\\text{/phút)},\\; t = 6\\text{ phút}',
    options: [
      'Vwater = 3,00 m³ và h = 3/π ≈ 0,95 m',
      'Vwater = 3,60 m³ và h ≈ 1,15 m',
      'Vwater = 3,00 m³ và h = 1,50 m',
      'Vwater = 4,20 m³ và h ≈ 1,34 m',
    ],
    correctIndex: 0,
    explanation:
      'Lưu lượng ròng Q = 0,6 − 0,1 = 0,5 m³/phút. Sau 6 phút: Vwater = 0,5 × 6 = 3 m³. Với hình trụ R = 1 m: h = V/(πR²) = 3/π ≈ 0,9549 m.',
  },
  {
    id: 'q9',
    level: 'Vận dụng',
    question:
      'Bơm nước với lưu lượng không đổi vào một bồn hình nón cụt loe dần lên trên (r₀ = 0,8 m ở đáy, r₁ = 1,8 m ở miệng). Khi mực nước dâng từ đáy lên miệng thì tốc độ tăng mực nước dh/dt biến đổi thế nào?',
    options: [
      'Giảm dần vì diện tích mặt thoáng π[r(h)]² ngày càng lớn.',
      'Tăng dần vì càng lên cao áp suất càng lớn.',
      'Không đổi vì lưu lượng máy bơm không đổi.',
      'Tăng lên cực đại ở giữa bồn rồi giảm.',
    ],
    correctIndex: 0,
    explanation:
      'Do dh/dt = Q / (π[r(h)]²), khi h tăng thì bán kính r(h) tăng từ 0,8 m lên 1,8 m làm mẫu số tăng, nên tốc độ dâng mực nước dh/dt giảm dần.',
  },
  {
    id: 'q10',
    level: 'Vận dụng',
    question:
      'Cần chế tạo bồn hình trụ kín (có cả đáy và nắp) dung tích 2π m³. So sánh Phương án A (R = 1 m, H = 2 m) và Phương án B (R = √2 m, H = 1 m), phương án nào tốn ít diện tích vật liệu vỏ hơn?',
    latex: 'V = \\pi R^2 H = 2\\pi\\text{ m}^3, \\quad S_{\\text{toàn phần}} = 2\\pi RH + 2\\pi R^2',
    options: [
      'Phương án A tốn ít vật liệu hơn (6π ≈ 18,85 m² so với (4 + 2√2)π ≈ 21,45 m²).',
      'Phương án B tốn ít vật liệu hơn vì chiều cao thấp hơn một nửa.',
      'Hai phương án có diện tích toàn phần bằng nhau vì cùng thể tích.',
      'Phương án A tốn nhiều vật liệu hơn (8π m² so với 6π m²).',
    ],
    correctIndex: 0,
    explanation:
      'Phương án A (H = 2R): S_A = 2π(1)(2) + 2π(1)² = 6π ≈ 18,85 m². Phương án B: S_B = 2π(√2)(1) + 2π(2) = (4 + 2√2)π ≈ 21,45 m². Phương án A tiết kiệm hơn khoảng 2,60 m² vật liệu!',
  },
];
