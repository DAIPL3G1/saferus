const verificaMail = document.getElementById("recuperar");
const urlBaseSQL = "https://saferusbackend.herokuapp.com";

verificaMail.addEventListener("click", async(event) => {
        const mail = document.getElementById("email").value;
        return fetch(`${urlBaseSQL}/forgetPassword?email=${mail}`, {
            method: 'PUT',
        }).then(result => {
            console.log(result.json);

        }).catch(error => {
            console.log(error);
        })

    })