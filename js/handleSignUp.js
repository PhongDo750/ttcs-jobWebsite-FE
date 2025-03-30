document.addEventListener("DOMContentLoaded", function () {

    const currentPath = window.location.href;
    const baseURL = window.location.origin;

    if(currentPath === `${baseURL}/components/login/login.html`) {
        // Lắng nghe sự kiện click vào lựa chọn role
        document.querySelectorAll(".role-select").forEach(item => {
            item.addEventListener("click", function () {
                const role = this.getAttribute("data-role"); // Lấy role (user/employer)
                localStorage.setItem("selectedRole", role); // Lưu vào localStorage
                console.log("Bạn đã chọn role:", role);
                // Điều hướng sang trang đăng ký
                window.location.href = "/components/signup/signUp.html";
            });
        });
    }

    if (currentPath === `${baseURL}/components/signup/signUp.html`) {
        const selectedRole = localStorage.getItem("selectedRole");
        if (selectedRole) {
            document.getElementById("form-title").innerText =
                selectedRole === "USER" ? "Thông tin người tìm việc" : "Thông tin nhà tuyển dụng";

            if (selectedRole === "USER") {
                document.getElementById("user-info").classList.remove("d-none-custom");
            } else {
                document.getElementById("company-info").classList.remove("d-none");
            }
        }
    }
});

//forgot password
