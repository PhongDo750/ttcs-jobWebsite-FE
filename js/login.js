//login using username + password

async function loginRequest(username, password) {
   try {
    const response = await fetch('http://localhost:8086/api/v1/user/log-in', {
        method : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({username, password})
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }
    console.log(data)

    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("role", data.role);

    if (data.role === 'USER') {
        window.location.href = "/components/main.html";
    } else if(data.role === 'RECRUITER'){
        window.location.href = "/components/recruiter-info/recruiter-info.html";
    } else {
        window.location.href = "/components/admin/admin.html";
    }
   } catch(error) {
        alert(error.message);
   }
}

document.getElementById("login").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    loginRequest(username, password);
});

