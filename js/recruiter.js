let currentPageRecruiter = 0;
const pageSizeRecruiter= 5;
document.querySelector('a[href="#info"]').addEventListener('shown.bs.tab', () => {
    document.getElementById("editJobForm").style.display = "none";
    document.getElementById("jobList").style.display = "block";
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
        localStorage.setItem("bgImg", recruiter.backgroundImage);
        localStorage.setItem("avatarImg", recruiter.imageUrl);
        const recruiterInfoContainer = document.getElementById('recruiter-info');
        recruiterInfoContainer.innerHTML = '';

        const infoHTML = `
            <div class="banner-container">
                <img src="${recruiter.backgroundImage}" alt="Ảnh nền">
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
                        <img src="${job.imageUrl}" class="w-15-custom">
        
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

        jobItem.addEventListener('click', () => {
            showEditForm(job.id);
        });

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

document.querySelector('a[href="#get-job"]').addEventListener('shown.bs.tab', () => {
    document.getElementById("editJobForm").style.display = "none";
    currentPageRecruiter = 0;
    loadJobsByState();
});

async function loadJobsByState() {
    try {
        const state = document.getElementById('jobState').value;
        const accessToken = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8086/api/v1/recruiter/state?state=${state}&page=${currentPageRecruiter}&size=${pageSizeRecruiter}`, {
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

        const jobs = result.content;
        const jobListContent = document.getElementById('jobs'); // Đây là <tbody>
        jobListContent.innerHTML = ''; // Xóa nội dung cũ

        jobs.forEach(job => {
            const jobItem = document.createElement('tr'); // Tạo <tr>

            jobItem.innerHTML = `
                <td>${job.userOutput.fullName}</td>
                <td><a href="${job.cvUrl}" target="_blank">Xem hồ sơ</a></td>
                <td>${job.jobName}</td>
                <td>${job.expirationDate}</td>
                ${state === "PENDING_APPROVAL" ? `
                <td>
                    <button class="btn bg-custom btn-sm accept-btn" data-job-id="${job.id}">Chấp nhận</button>
                    <button class="btn btn-danger btn-sm reject-btn" data-job-id="${job.id}">Từ chối</button>
                </td>` : ''}
            `;

            jobListContent.appendChild(jobItem);
        });

        // Gán sự kiện sau khi DOM đã cập nhật
        document.querySelectorAll(".accept-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const jobId = event.target.dataset.jobId;
                acceptApplication(jobId);
            });
        });

        document.querySelectorAll(".reject-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const jobId = event.target.dataset.jobId;
                rejectApplication(jobId);
            });
        });

        updatePagination(result, "pagination-1");
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function acceptApplication(id) {
    const accessToken = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:8086/api/v1/recruiter/accept?recruiterJobId=${id}`, {
            method: "POST",
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

        alert("Xét duyệt thành công");
        loadJobsByState();
    } catch (error) {
        alert(error.message);
    }
}

async function rejectApplication(id) {
    const accessToken = localStorage.getItem("token");
    try {
        const response = await fetch(`http://localhost:8086/api/v1/recruiter/reject?recruiterJobId=${id}`, {
            method: "POST",
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

        alert("Bạn đã từ chối ứng viên");
        loadJobsByState();
    } catch (error) {
        alert(error.message);
    }
}

function toggleActionColumn() {
    const selectedState = document.getElementById("jobState").value;
    const actionColumns = document.querySelectorAll(".action-column"); // Lấy tất cả cột "Hành động"
    
    if (selectedState === "PENDING_APPROVAL") {
        actionColumns.forEach(col => col.style.display = "table-cell"); // Hiện cột
    } else {
        actionColumns.forEach(col => col.style.display = "none"); // Ẩn cột
    }
}

document.querySelectorAll('.imageInput').forEach(input => {
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            const previewImage = this.previousElementSibling.previousElementSibling; // Lấy đúng ảnh cùng cha
            previewImage.src = imageUrl;
        }
    });
});

document.getElementById('updateInfomationCompany').addEventListener('click', () => {
    setTimeout(() => {
        CKEDITOR.instances['editor4'].updateElement();
        changeInfoCompany();
    }, 100);
})

async function changeInfoCompany() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Bạn cần đăng nhập trước khi thay đổi thông tin!");
            return;
        }

        const fullName = document.getElementById('nameCompany').value;
        const address = document.getElementById('address-1').value;
        const avatar = document.getElementById("imageCompany").files[0];
        const backgroundImg = document.getElementById('backgroundImg').files[0];
        const description = cleanCKEditorContent(CKEDITOR.instances['editor4'].getData());

        // Chuẩn bị dữ liệu JSON
        const userData = {
            fullName,
            address,
            description
        };

        // Tạo FormData để gửi ảnh và JSON cùng lúc
        const formData = new FormData();
        formData.append("new_user_info", JSON.stringify(userData)); // Dữ liệu người dùng dạng JSON
        if (avatar) {
            formData.append("image", avatar); // Nếu có ảnh, thêm vào FormData
        }

        if (backgroundImg) {
            formData.append("background_img", backgroundImg);
        }

        const submitButton = document.getElementById("updateInfomationCompany");
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Đang gửi...`;

        // Gọi API cập nhật thông tin
        const response = await fetch("http://localhost:8086/api/v1/user/change-user-information", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData // Gửi dữ liệu dạng multipart/form-data
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

        alert("Cập nhật thông tin thành công!");
        localStorage.setItem("bgImg", backgroundImg);
        localStorage.setItem("avatarImg", avatar);
        location.reload();
    } catch (error) {
        alert(`Lỗi cập nhật: ${error.message}`);
    } finally {
        const submitButton = document.getElementById("updateInfomationCompany");
        submitButton.disabled = false;
        submitButton.innerHTML = "Thay đổi thông tin";
    }
}

function convertDateToInputFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function showEditForm(jobId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:8086/api/v1/job/descriptions?jobId=${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
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

        // Ẩn danh sách
        document.getElementById("jobList").style.display = "none";
        document.getElementById("pagination").style.display = "none";

        // Hiện form sửa
        document.getElementById("editJobForm").style.display = "block";

        // Đổ dữ liệu vào form
        document.getElementById('name-job-edit').value = result.data.jobName;
        document.getElementById('occupation-edit').value = result.data.occupationName;
        document.getElementById('experience-edit').value = result.data.experience;
        document.getElementById('head-count-edit').value = result.data.headCount;
        const expiration = result.data.expirationDate; 
        document.getElementById('expiration-date-edit').value = convertDateToInputFormat(expiration);
        document.getElementById('province-edit').value = result.data.province;
        document.getElementById('address-edit').value = result.data.address;
        document.getElementById('jobType-edit').value = result.data.jobType;
        document.getElementById('jobLevel-edit').value = result.data.jobLevel;
        document.getElementById('min-salary-edit').value = result.data.minSalary;
        document.getElementById('max-salary-edit').value = result.data.maxSalary;
        document.getElementById('educationLevel-edit').value = result.data.educationLevel;
        
        setTimeout(() => {
            if (CKEDITOR.instances['editor1-1']) CKEDITOR.instances['editor1-1'].setData(result.data.descriptions || '');
            if (CKEDITOR.instances['editor2-2']) CKEDITOR.instances['editor2-2'].setData(result.data.requiredJobList || '');
            if (CKEDITOR.instances['editor3-3']) CKEDITOR.instances['editor3-3'].setData(result.data.employeeBenefitList || '');
        }, 500);

        // Gán lại sự kiện cho 3 nút
        document.getElementById('cancelEditJob').onclick = () => {
            document.getElementById("editJobForm").style.display = "none";
            document.getElementById("jobList").style.display = "block";
            document.getElementById("pagination").style.display = "flex";
        };

        document.getElementById('deleteJobBtn').onclick = async () => {
            if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                await deleteJob(jobId);
            }
        };

        document.getElementById('updateJobBtn').onclick = async () => {
            await updateJob(jobId);
        };

    } catch (error) {
        alert(error.message);
    }
}

async function updateJob(jobId) {
    const token = localStorage.getItem('token');

    try {
        // Update dữ liệu từ CKEditor vào textarea
        CKEDITOR.instances['editor1-1'].updateElement();
        CKEDITOR.instances['editor2-2'].updateElement();
        CKEDITOR.instances['editor3-3'].updateElement();

        // Lấy dữ liệu từ form
        const data = {
            jobName: document.getElementById('name-job-edit').value,
            occupationName: document.getElementById('occupation-edit').value,
            experience: document.getElementById('experience-edit').value,
            headCount: document.getElementById('head-count-edit').value,
            expirationDate: new Date(document.getElementById('expiration-date-edit').value).toISOString(),
            province: document.getElementById('province-edit').value,
            address: document.getElementById('address-edit').value,
            jobType: document.getElementById('jobType-edit').value,
            jobLevel: document.getElementById('jobLevel-edit').value,
            minSalary: document.getElementById('min-salary-edit').value,
            maxSalary: document.getElementById('max-salary-edit').value,
            educationLevel: document.getElementById('educationLevel-edit').value,
            descriptions: cleanCKEditorContent(CKEDITOR.instances['editor1-1'].getData()),
            requiredJobList: cleanCKEditorContent(CKEDITOR.instances['editor2-2'].getData()),
            employeeBenefitList: cleanCKEditorContent(CKEDITOR.instances['editor3-3'].getData())
        };

        console.log("Data gửi lên server:", data);

        const response = await fetch(`http://localhost:8086/api/v1/job/update?jobId=${jobId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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

        alert('Cập nhật công việc thành công!');
        location.reload();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteJob(jobId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:8086/api/v1/job/delete?jobId=${jobId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
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

        alert('Xóa công việc thành công!');
        location.reload();
    } catch (error) {
        alert(error.message);
    }
}


document.querySelector('a[href="#change-info"]').addEventListener('shown.bs.tab', () => {
    document.getElementById("editJobForm").style.display = "none";
});

document.querySelector('a[href="#post-job"]').addEventListener('shown.bs.tab', () => {
    document.getElementById("editJobForm").style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    getInfomationUser();
    getJobOfRecruiter(currentPageRecruiter, pageSizeRecruiter);
    if (document.getElementById('editor1')) CKEDITOR.replace('editor1');
    if (document.getElementById('editor2')) CKEDITOR.replace('editor2');
    if (document.getElementById('editor3')) CKEDITOR.replace('editor3');
    if (document.getElementById('editor4')) CKEDITOR.replace('editor4');
    if (document.getElementById('editor1-1')) CKEDITOR.replace('editor1-1');
    if (document.getElementById('editor2-2')) CKEDITOR.replace('editor2-2');
    if (document.getElementById('editor3-3')) CKEDITOR.replace('editor3-3');
    loadJobsByState();

    const avatarImg = localStorage.getItem('avatarImg');
    const bgImg = localStorage.getItem('bgImg');

    if (avatarImg) {
        document.getElementById('avatarPreview').src = avatarImg;
    }

    if (bgImg) {
        document.getElementById('backgroundPreview').src = bgImg;
    }
});