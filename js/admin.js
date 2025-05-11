let currentPageAdmin = 0;
const pageSizeAdmin = 5;

document.querySelector('a[href="#userManagement"]').addEventListener('shown.bs.tab', () => {
    getAllUsers(currentPageAdmin, pageSizeAdmin);
});

async function getAllUsers(currentPageAdmin, pageSizeAdmin) {
    try {
        const accessToken = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8086/api/v1/admin?page=${currentPageAdmin}&size=${pageSizeAdmin}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        const users = result.content;
        const userListContent = document.getElementById('users'); // Đây là <tbody>
        userListContent.innerHTML = ''; // Xóa nội dung cũ

        users.forEach(user => {
            const userItem = document.createElement('tr'); // Tạo <tr>

            userItem.innerHTML = `
                <td>${user.username ? user.username : "Tài khoản Google"}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-user-id="${user.id}">Xóa tài khoản</button></td>
            `;

            userListContent.appendChild(userItem);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const userId = event.target.dataset.userId;
                deleteUser(userId);
            });
        });

        updatePagination(result, "pagination");
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function countUsers() {
    try {
        const accessToken = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8086/api/v1/admin/counts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        const countItem = document.getElementById('countUser');
        countItem.innerHTML = `
            <div class="col-3 rounded-2 shadow">
                <h3 class="mt-2">Tổng số ứng viên</h3>
                <div class="fs-1 text-custom">
                    <p>${result.data.countRoleUser}</p>
                </div>    
            </div>

            <div class="col-4 ms-4 rounded-2 shadow">
                <h3 class="mt-2">Tổng số nhà tuyển dụng</h3>
                <div class="fs-1 text-custom">
                    <p>${result.data.countRoleRecruiter}</p>
                </div> 
            </div>
        ` 
    } catch (error) {
        alert(error.message);
    }
}

async function deleteUser(id) {
    const accessToken = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:8086/api/v1/admin/delete?userId=${id}`, {
            method: "DELETE",
            headers : {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const result = await response.json()

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        alert("User đã được xóa");
        countUsers();
        getAllUsers(currentPageAdmin, pageSizeAdmin);
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById('search').addEventListener('click', () => {
    getUserByEmail();
})

async function getUserByEmail() {
    const accessToken = localStorage.getItem("token");
    const email = document.getElementById('email').value;

    if (email === null || email === '') {
        alert("Nhập email");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8086/api/v1/admin/get-user?email=${email}`, {
            method: "GET",
            headers : {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const result = await response.json()

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        const userListContent = document.getElementById('users'); // Đây là <tbody>
        userListContent.innerHTML = ''; 
        const userItem = document.createElement('tr'); // Tạo <tr>

        userItem.innerHTML = `
            <td>${result.data.username ? result.data.username : "Tài khoản Google"}</td>
            <td>${result.data.fullName}</td>
            <td>${result.data.email}</td>
            <td>${result.data.role}</td>
            <td>${result.data.birthday ? new Date(result.data.birthday).toISOString().split('T')[0] : ''}</td>
            <td><button class="btn btn-danger btn-sm delete-btn" data-user-id="${result.data.id}">Xóa tài khoản</button></td>
        `;
        userListContent.appendChild(userItem);
    } catch (error) {
        alert(error.message);
    }
}


////////////////////////////////////////////////////////////////////
document.querySelector('a[href="#jobManagment"]').addEventListener('shown.bs.tab', () => {
    let month = document.getElementById('month').value;
    let year = document.getElementById('year').value;

    if (!month) {
        month = new Date().getMonth() + 1;
    }

    if (!year) {
        year = new Date().getFullYear();
    }

    localStorage.setItem('month', month);
    localStorage.setItem('year', year);

    currentPageAdmin = 0;
    countJobsAndApplicationsInMonth(month, year);
    getJobsPostedInMonthAndYear(month, year, currentPageAdmin, pageSizeAdmin);
});

document.getElementById('searchByMonthAndYear').addEventListener('click', () => {
    const monthInput = document.getElementById('month').value.trim();
    const yearInput = document.getElementById('year').value.trim();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Regex kiểm tra xem input có phải là số nguyên dương
    const numberRegex = /^\d+$/;

    // Kiểm tra tháng
    if (monthInput && (!numberRegex.test(monthInput) || +monthInput < 1 || +monthInput > 12)) {
        alert("Tháng phải là số từ 1 đến 12.");
        return;
    }

    // Kiểm tra năm
    if (yearInput && (!numberRegex.test(yearInput) || +yearInput > currentYear || +yearInput < 1900)) {
        alert(`Năm phải là số nhở hơn hoặc bằng năm ${currentYear}.`);
        return;
    }

    // Dùng tháng/năm hiện tại nếu để trống
    const month = monthInput ? parseInt(monthInput) : currentDate.getMonth() + 1;
    const year = yearInput ? parseInt(yearInput) : currentYear;

    localStorage.setItem('month', month);
    localStorage.setItem('year', year);

    countJobsAndApplicationsInMonth(month, year);
    getJobsPostedInMonthAndYear(month, year, currentPageAdmin, pageSizeAdmin);
})

async function countJobsAndApplicationsInMonth(month, year) {
    try {
        const accessToken = localStorage.getItem('token');

        console.log(month, year);

        // Gửi hai request đồng thời
        const [jobsResponse, usersAppliedResponse] = await Promise.all([
            fetch(`http://localhost:8086/api/v1/admin/job-posted?year=${year}&month=${month}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }),
            fetch(`http://localhost:8086/api/v1/admin/user-applied?year=${year}&month=${month}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
        ]);

        // Chuyển cả hai response thành JSON
        const [jobsResult, userAppliedResult] = await Promise.all([
            jobsResponse.json(),
            usersAppliedResponse.json()
        ]);

        // Kiểm tra nếu có lỗi
        if (!jobsResponse.ok) {
            if (jobsResult.message === "INVALID_FIELD" && typeof jobsResult.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(jobsResult.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(jobsResult.message);
        }

        if (!usersAppliedResponse.ok) {
            if (userAppliedResult.message === "INVALID_FIELD" && typeof userAppliedResult.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(userAppliedResult.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(userAppliedResult.message);
        }

        // Cập nhật giao diện
        const countItem = document.getElementById('countJob');
        countItem.innerHTML = `
            <div class="col-5 rounded-2 shadow">
                <h3 class="mt-2">Tổng số công việc trong tháng</h3>
                <div class="fs-1 text-custom">
                    <p>${jobsResult.data}</p>
                </div>    
            </div>

            <div class="col-5 ms-4 rounded-2 shadow">
                <h3 class="mt-2">Tổng số đơn ứng tuyển trong tháng</h3>
                <div class="fs-1 text-custom">
                    <p>${userAppliedResult.data}</p>
                </div> 
            </div>
        `;
    } catch (error) {
        alert(error.message);
    }
}

async function getJobsPostedInMonthAndYear(month, year, currentPageAdmin, pageSizeAdmin) {
    try {
        const accessToken = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8086/api/v1/admin/jobs?month=${month}&year=${year}&page=${currentPageAdmin}&size=${pageSizeAdmin}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const result = await response.json();
        console.log(result)

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        const jobs = result.content;
        const jobListContent = document.getElementById('jobs'); // Đây là <tbody>
        jobListContent.innerHTML = ''; // Xóa nội dung cũ

        jobs.forEach(job => {
            const jobItem = document.createElement('tr'); // Tạo <tr>

            jobItem.innerHTML = `
                <td>${job.id}</td>
                <td>${job.nameRecruiter}</td>
                <td>${job.jobName}</td>
                <td>${job.createdAt}</td>
                <td><button class="btn btn-danger btn-sm delete-btn" data-job-id="${job.id}">Xóa công việc</button></td>
            `;

            jobListContent.appendChild(jobItem);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const jobId = event.target.dataset.jobId;
                deleteJob(jobId);
            });
        });

        updatePagination(result, "pagination-1");
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function deleteJob(jobId) {
    const accessToken = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:8086/api/v1/admin/job?jobId=${jobId}`, {
            method: "DELETE",
            headers : {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const result = await response.json()

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        alert("User đã được xóa");
        getJobsPostedInMonthAndYear(localStorage.getItem('month'), localStorage.getItem('year'), currentPageAdmin, pageSizeAdmin);
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById('searchBtn').addEventListener('click', () => {
    getJobById();
})

async function getJobById() {
    const accessToken = localStorage.getItem("token");
    const code = document.getElementById('code').value;

    console.log(code);

    if (code === null || code === '') {
        alert("Nhập mã sản phẩm");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8086/api/v1/admin/job?jobId=${code}`, {
            method: "GET",
            headers : {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        const result = await response.json()

        console.log(result);

        if (!response.ok) {
            if (result.message === "INVALID_FIELD" && typeof result.error === "object") {
                // Gộp tất cả lỗi lại thành 1 chuỗi
                const errorMessages = Object.entries(result.error)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join("\n");
                throw new Error(errorMessages);
            }
            throw new Error(result.message);
        }

        const jobListContent = document.getElementById('jobs'); // Đây là <tbody>
        jobListContent.innerHTML = '';

        const jobItem = document.createElement('tr'); // Tạo <tr>

        jobItem.innerHTML = `
            <td>${result.data.id}</td>
            <td>${result.data.nameRecruiter}</td>
            <td>${result.data.jobName}</td>
            <td>${result.data.createdAt}</td>
            <td><button class="btn btn-danger btn-sm delete-btn" data-job-id="${job.id}">Xóa công việc</button></td>
        `;

        jobListContent.appendChild(jobItem);
    } catch (error) {
        alert(error.message);
    }
}


///////////////////////////////////////////////////////////////////////
function updatePagination(data, paginationId) {
    const pagination = document.getElementById(paginationId);
    pagination.innerHTML = '';

    const totalPages = data.totalPages || Math.ceil(data.totalElements / pageSizeAdmin);
    console.log("Total Pages:", totalPages);
    if (!totalPages || totalPages <= 1) return;

    const maxVisibleButtons = 5;

    const createButton = (page, text = page + 1, isDisabled = false) => {
        const button = document.createElement('button');
        button.innerText = text;
        button.classList.add('btn', 'btn-outline-primary', 'mx-1');
        if (isDisabled) button.classList.add('disabled');
        if (page === currentPageAdmin) button.classList.add('active');

        button.addEventListener('click', () => {
            if (page !== currentPageAdmin) {
                currentPageAdmin = page;
                getAllUsers(currentPageAdmin, pageSizeAdmin);
                getJobsPostedInMonthAndYear(localStorage.getItem('month'), localStorage.getItem('year'), currentPageAdmin, pageSizeAdmin);
            }
        });

        pagination.appendChild(button);
    };

    if (currentPageAdmin > 0) createButton(currentPageAdmin - 1, '«');

    if (totalPages <= maxVisibleButtons) {
        // Hiển thị toàn bộ nếu số trang nhỏ
        for (let i = 0; i < totalPages; i++) createButton(i);
    } else {
        // Hiển thị trang đầu tiên
        createButton(0);

        let startPage = Math.max(1, currentPageAdmin - 2);
        let endPage = Math.min(totalPages - 2, currentPageAdmin + 2);

        if (currentPageAdmin <= 2) {
            endPage = 4;
        } else if (currentPageAdmin >= totalPages - 3) {
            startPage = totalPages - 5;
        }

        if (startPage > 1) {
            createButton(null, '...', true); // Dấu "..."
        }

        for (let i = startPage; i <= endPage; i++) {
            createButton(i);
        }

        if (endPage < totalPages - 2) {
            createButton(null, '...', true); // Dấu "..."
        }

        // Hiển thị trang cuối cùng
        createButton(totalPages - 1);
    }

    // Nút "Sau"
    if (currentPageAdmin < totalPages - 1) createButton(currentPageAdmin + 1, '»');
}

document.addEventListener("DOMContentLoaded", function () {
    countUsers();
    getAllUsers(currentPageAdmin, pageSizeAdmin);
});