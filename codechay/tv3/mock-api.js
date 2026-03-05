const MockAPI = (() => {

    const results = [
        {
            id: 1,
            username: "sv001",
            exam: "Luyện tập Mạng Máy Tính",
            score: 0.0,
            correct: 0,
            total: 10,
            duration: "0m 6s",
            submittedAt: "09:39 05/03/2026",
        },
        {
            id: 2,
            username: "sv001",
            exam: "Luyện tập Mạng Máy Tính",
            score: 9.0,
            correct: 9,
            total: 10,
            duration: "0m 3s",
            submittedAt: "16:44 04/03/2026",
        },
        {
            id: 3,
            username: "sv010",
            exam: "Nhập môn AI",
            score: 6.5,
            correct: 13,
            total: 20,
            duration: "12m 02s",
            submittedAt: "20:10 01/03/2026",
        },
        {
            id: 4,
            username: "sv005",
            exam: "Cơ sở dữ liệu",
            score: 8.0,
            correct: 8,
            total: 10,
            duration: "9m 45s",
            submittedAt: "14:20 02/03/2026",
        },
        {
            id: 5,
            username: "sv003",
            exam: "Nhập môn AI",
            score: 4.0,
            correct: 8,
            total: 20,
            duration: "18m 30s",
            submittedAt: "11:05 03/03/2026",
        },
    ];

    const myResult = {
        username: "sv001",
        exam: "Luyện tập Mạng Máy Tính",
        score: 7.0,
        correct: 7,
        total: 10,
        duration: "8m 22s",
        submittedAt: "09:39 05/03/2026",
        questions: [
            {
                number: 1,
                text: "Mô hình OSI có bao nhiêu tầng?",
                options: ["5 tầng", "6 tầng", "7 tầng", "8 tầng"],
                correctIndex: 2,
                chosenIndex: 1,
                explain: "Mô hình OSI gồm 7 tầng: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
            },
            {
                number: 2,
                text: "Giao thức nào hoạt động ở tầng Transport?",
                options: ["HTTP", "TCP", "IP", "ARP"],
                correctIndex: 1,
                chosenIndex: 1,
                explain: "TCP (Transmission Control Protocol) hoạt động ở tầng Transport.",
            },
            {
                number: 3,
                text: "Địa chỉ IP thuộc lớp nào của mô hình OSI?",
                options: ["Tầng 2", "Tầng 3", "Tầng 4", "Tầng 5"],
                correctIndex: 1,
                chosenIndex: 1,
                explain: "Địa chỉ IP thuộc tầng Network (tầng 3).",
            },
        ],
    };

    function getAllResults() {
        return [...results];
    }

    function filterResults(username = "", exam = "") {
        return results.filter((r) => {
            const matchUser = !username || r.username.toLowerCase().includes(username.toLowerCase());
            const matchExam = !exam || exam === "Tất cả" || r.exam === exam;
            return matchUser && matchExam;
        });
    }

    function getMyResult() {
        return { ...myResult };
    }

    return { getAllResults, filterResults, getMyResult };
})();
