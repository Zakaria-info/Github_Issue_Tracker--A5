const form = document.getElementById("login-form");

form.addEventListener("submit", function(event){

    event.preventDefault();

    const username = document.getElementById("input-username").value;
    const password = document.getElementById("input-password").value;

    if(username === "admin" && password === "admin123"){
        alert("Sign In Success");
        window.location.href = "home.html";
    }else{
        alert("Sign In Failed");
    }

});