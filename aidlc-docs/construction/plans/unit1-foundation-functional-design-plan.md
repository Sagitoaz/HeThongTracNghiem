# Unit 1 Functional Design Plan — Shared Foundation

## Execution Checklist

- [x] Step 1: Phân tích unit definition và responsibilities
- [x] Step 2: Tạo `domain-entities.md` — schemas đầy đủ cho localStorage
- [x] Step 3: Tạo `business-rules.md` — validation, auth, scoring rules
- [x] Step 4: Tạo `business-logic-model.md` — data flow và logic
- [x] Step 5: Không có UI cho unit này (infrastructure only)

## Design Decisions
- Đủ context từ Application Design và Requirements — không cần hỏi thêm
- Schemas theo Application Design component-methods.md
- Auth dùng plain text password so sánh (demo, không cần hash)
- ID generation: `Date.now() + '-' + Math.random().toString(36).substr(2,9)`
