const signupForm = document.querySelector("#signup");
function signup (signupData) {
    // POST /auth/login
    const options = { 
        method: "POST",
        headers: {
            // This header specifies the type of content we're sending.
            // This is required for endpoints expecting us to send
            // JSON data.
            "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
    };

    return fetch(apiBaseURL + "/api/users", options)
        .then(response => response.json())
        .then(signupData => {
            if (signupData.message === "Invalid username or password") {
                console.error(signupData)
                // Here is where you might want to add an error notification 
                // or other visible indicator to the page so that the user is  
                // informed that they have entered the wrong login info.
                return null
            }

            window.localStorage.setItem("login-data", JSON.stringify(signupData));
            window.location.assign("index.html");  // redirect

            return signupData;
        });
}

signupForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // We can use loginForm.username (for example) to access
    // the input element in the form which has the ID of "username".
    const signupData = {
        username: signupForm.username.value,
        fullName: signupForm.fullname.value,
        password: signupForm.password.value,
    }

    // Disables the button after the form has been submitted already:
    // signupForm.loginButton.disabled = true;

    // Time to actually process the login using the function from auth.js!
    signup(signupData);
};