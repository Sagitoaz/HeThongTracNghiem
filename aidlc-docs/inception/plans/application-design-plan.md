# Application Design Plan — Hệ Thống Trắc Nghiệm Trực Tuyến

## Execution Checklist

- [x] Step 1: Phân tích requirements + user stories để xác định components
- [x] Step 2: Tạo `components.md` — 10 page components + 6 services
- [x] Step 3: Tạo `component-methods.md` — method signatures
- [x] Step 4: Tạo `services.md` — service definitions và orchestration
- [x] Step 5: Tạo `component-dependency.md` — dependency matrix + data flow
- [x] Step 6: Validate design completeness

## Design Decisions (từ Requirements + Stories)
- **Pattern**: Service-based với shared services layer (AuthService, DataService, v.v.)
- **Data**: localStorage là nguồn sự thật duy nhất
- **Navigation**: Điều hướng qua `window.location.href`, session qua localStorage
- **Component boundaries**: Mỗi trang HTML là 1 component, có JS file riêng
- **Không hỏi thêm**: Tất cả quyết định thiết kế đã rõ từ Requirements + Stories
