# Unit of Work Plan — Hệ Thống Trắc Nghiệm Trực Tuyến

## Execution Checklist

- [x] Step 1: Phân tích Application Design — xác định ranh giới units
- [x] Step 2: Tạo `unit-of-work.md` — 5 units với responsibilities
- [x] Step 3: Tạo `unit-of-work-dependency.md` — dependency matrix
- [x] Step 4: Tạo `unit-of-work-story-map.md` — ánh xạ stories → units
- [x] Step 5: Validate unit boundaries và story coverage
- [x] Step 6: Kiểm tra code organization strategy (Greenfield single-repo)

## Decomposition Decisions
- **Deployment model**: Single-repo static site, không cần microservices
- **Grouping strategy**: Theo business domain và dependency order
- **5 units**: Shared Foundation → Auth → User Exam Flow → Admin Core → Admin Reports
- **Build order**: Units 1→2→3→4→5 (mỗi unit phụ thuộc unit trước)
- **Không hỏi thêm**: Tất cả đã rõ từ Application Design và execution plan
