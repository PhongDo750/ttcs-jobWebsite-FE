let currentPageRecruiter = 0;
const pageSizeRecruiter= 5;
document.querySelector('a[href="#info"]').addEventListener('shown.bs.tab', () => {
    getInfomationUser();
    getJobOfRecruiter(currentPageRecruiter, pageSizeRecruiter);
});

async function getInfomationUser() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Bạn cần đăng nhập trước khi xem thông tin!");
            return;
        }

        const response = await fetch(`http://localhost:8086/api/v1/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
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

        const recruiter = result.data;
        const recruiterInfoContainer = document.getElementById('recruiter-info');
        recruiterInfoContainer.innerHTML = '';

        const infoHTML = `
            <div class="banner-container">
                <img src="/assets/image/company_cover_1.webp" alt="Ảnh nền">
            </div>
                    
            <div class="profile-container d-flex">
                <img src="${recruiter.imageUrl}" alt="FaceNet Logo" class="profile-image">
                <div class="profile-info">
                    <h5 class="mb-1">${recruiter.fullName}</h5>
                    <p class="mb-0">
                        🌐 <a href="https://facenet.vn/" class="text-white text-decoration-none">https://facenet.vn/</a> &nbsp; |  
                        🏢 25-99 nhân viên &nbsp; |  
                        👥 97 người theo dõi
                    </p>
                </div>
            </div>                    
            <hr class="my-2">
    
            <div class="mt-2">
                <h2>Giới thiệu về công ty</h2>
                <p class="ps-5">${recruiter.description ? recruiter.description : " "}</p>
            </div>        
        `;

        recruiterInfoContainer.innerHTML = infoHTML;
    } catch (error) {
        alert(error.message);
    }
}

async function getJobOfRecruiter(currentPageRecruiter, pageSizeRecruiter) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Bạn cần đăng nhập trước khi xem thông tin!");
            return;
        }

        const response = await fetch(`http://localhost:8086/api/v1/recruiter?page=${currentPageRecruiter}&size=${pageSizeRecruiter}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
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

        renderJobs(result.content);
        updatePagination(result, "pagination");
    } catch (error) {
        alert(error.message);
    }
}

function renderJobs(jobs) {
    const jobList = document.getElementById("jobList");
    if (!jobList) {
        console.error("Không tìm thấy phần tử jobList trong DOM");
        return;
    }
    jobList.innerHTML = "";

    jobs.forEach(job => {
        console.log(job);
        const jobItem = document.createElement("div");
        jobItem.classList.add("likedJob");
        jobItem.innerHTML = `
            <div class="position-relative job-card shadow p-2 mt-4">
                <div class="d-flex flex-column mb-2">
                    <div class="d-flex align-items-center">
                        <img src="${job.imageUrl}" class="rounded-circle w-10">
        
                        <div class="ms-3">
                            <p class="my-2">${job.jobName}</p>
                            <P class="mb-2">${job.nameRecruiter}</P>
                            <div class="d-flex align-items-center mb-2">
                                <i class="fa-solid fa-circle-dollar-to-slot me-2"></i>
                                <p class="text-custom mb-0">${job.minSalary} - ${job.maxSalary} Triệu</p>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                                <i class="fa-solid fa-location-dot me-2"></i>
                                <p class="text-custom mb-0">${job.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-end align-items-center">
                    <i class="fa-solid fa-calendar-days me-2"></i>
                    <p class="text-custom mb-0">${job.expirationDate}</p>
                </div>
            </div>
        `;
        jobList.appendChild(jobItem);
    });
}

function cleanCKEditorContent(html) {
    // Giải mã HTML entities (chuyển &agrave; → à, &ocirc; → ô, ...)
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    let text = textarea.value;

    // Thay thế tất cả thẻ <p> và <div> thành xuống dòng <br>
    text = text.replace(/<\/p>\s*<p>/g, "<br>") // Ghép đoạn <p> lại
                .replace(/<\/?p>/g, "")          // Xóa thẻ <p>
                .replace(/<\/?div>/g, "")        // Xóa thẻ <div>
                .replace(/\n/g, "<br>")          // Đảm bảo xuống dòng

    return text.trim();
}

document.getElementById('createJob').addEventListener('click', () => {
    setTimeout(() => {
        CKEDITOR.instances['editor1'].updateElement();
        CKEDITOR.instances['editor2'].updateElement();
        CKEDITOR.instances['editor3'].updateElement();

        console.log("Descriptions:", CKEDITOR.instances['editor1'].getData());
        console.log("Required Job List:", CKEDITOR.instances['editor2'].getData());
        console.log("Employee Benefit List:", CKEDITOR.instances['editor3'].getData());

        createJob();
    }, 100);
});

async function createJob() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Bạn cần đăng nhập trước khi thay đổi thông tin!");
            return;
        }

        const jobName = document.getElementById('name-job').value;
        const occupationName = document.getElementById('occupation').value;
        const experience = document.getElementById('experience').value;
        const headCount = document.getElementById('head-count').value;
        const expirationDate = new Date(document.getElementById('expiration-date').value).toISOString();
        const province = document.getElementById('province').value;
        const address = document.getElementById('address').value;
        const jobType = document.getElementById('jobType').value;
        const jobLevel = document.getElementById('jobLevel').value;
        const minSalary = document.getElementById('min-salary').value;
        const maxSalary = document.getElementById('max-salary').value;
        const educationLevel = document.getElementById("educationLevel").value;

        // Lấy dữ liệu từ CKEditor
        const descriptions = cleanCKEditorContent(CKEDITOR.instances['editor1'].getData());
        const requiredJobList = cleanCKEditorContent(CKEDITOR.instances['editor2'].getData());
        const employeeBenefitList = cleanCKEditorContent(CKEDITOR.instances['editor3'].getData());

        // Chuẩn bị dữ liệu JSON
        const formData = {
            jobName, occupationName, experience, headCount, expirationDate, province, address,
            jobType, jobLevel, minSalary, maxSalary, educationLevel,
            descriptions, requiredJobList, employeeBenefitList
        };

        // Gọi API cập nhật thông tin
        const response = await fetch("http://localhost:8086/api/v1/job/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
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

        console.log("Đăng tuyển thành công");

        alert('Đăng tuyển thông tin thành công');
        location.reload();
    } catch (error) {
        alert(`${error.message}`);
    }
}

function updatePagination(data, paginationId) {
    const pagination = document.getElementById(paginationId);
    pagination.innerHTML = '';

    const totalPages = data.totalPages || Math.ceil(data.totalElements / pageSizeRecruiter);
    console.log("Total Pages:", totalPages);
    if (!totalPages || totalPages <= 1) return;

    const maxVisibleButtons = 5;

    const createButton = (page, text = page + 1, isDisabled = false) => {
        const button = document.createElement('button');
        button.innerText = text;
        button.classList.add('btn', 'btn-outline-primary', 'mx-1');
        if (isDisabled) button.classList.add('disabled');
        if (page === currentPageRecruiter) button.classList.add('active');

        button.addEventListener('click', () => {
            if (page !== currentPageRecruiter) {
                currentPageRecruiter = page;
                getJobOfRecruiter(currentPageRecruiter, pageSizeRecruiter);
                loadJobsByState();
            }
        });

        pagination.appendChild(button);
    };

    if (currentPageRecruiter > 0) createButton(currentPageRecruiter - 1, '«');

    if (totalPages <= maxVisibleButtons) {
        // Hiển thị toàn bộ nếu số trang nhỏ
        for (let i = 0; i < totalPages; i++) createButton(i);
    } else {
        // Hiển thị trang đầu tiên
        createButton(0);

        let startPage = Math.max(1, currentPageRecruiter - 2);
        let endPage = Math.min(totalPages - 2, currentPageRecruiter + 2);

        if (currentPageRecruiter <= 2) {
            endPage = 4;
        } else if (currentPageRecruiter >= totalPages - 3) {
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
    if (currentPageRecruiter < totalPages - 1) createButton(currentPageRecruiter + 1, '»');
}

document.addEventListener("DOMContentLoaded", function () {
    getInfomationUser();
    getJobOfRecruiter(currentPageRecruiter, pageSizeRecruiter);
    if (document.getElementById('editor1')) CKEDITOR.replace('editor1');
    if (document.getElementById('editor2')) CKEDITOR.replace('editor2');
});