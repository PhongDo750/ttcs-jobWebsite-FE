async function register(formData) {
    try {
        const response = await fetch('http://localhost:8086/api/v1/user/sign-up', {
            method: "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify(formData)
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
        localStorage.setItem("token", result.data.accessToken);
        localStorage.setItem("role", result.data.role);

        window.location.href = "/components/login/login.html"
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const role = localStorage.getItem('selectedRole');

    // Gửi dữ liệu sau khi đã loại bỏ required
    const formData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        email: document.getElementById("mail").value,
        phoneNumber: document.getElementById("phone-number").value,
        fullName: role === "RECRUITER" ? document.getElementById("company-name").value : document.getElementById("full-name").value,
        address: role === "RECRUITER" ? document.getElementById("company-address").value : document.getElementById("address").value,
        role: role
    };

    register(formData); // Gửi dữ liệu sau khi đã xử lý
});