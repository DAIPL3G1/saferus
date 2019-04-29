window.onload = function() {
  const urlBase = "https://saferusbackend.herokuapp.com";
  const btnLogin = document.getElementsByClassName("btnLogin");
  const btnRegisto = document.getElementById("btnRegisto");

  async function readuser(){
    const response = await fetch(`${urlBase}/authenticated`);
    const result = await response;
    console.log(result)
  }

  // Fazer login
  for (let i = 0; i < btnLogin.length; i++) {
    btnLogin[i].addEventListener("click", () => {
      swal({
          /* Desenho do modal */
          title: "Acesso à sua área privada",
          html: '<input id="txtEmail" class="swal2-input" placeholder="E-mail">' +
            '<input type="password" id="txtPass" class="swal2-input" placeholder="Password">',
          showCancelButton: true,
          confirmButtonText: "Entrar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: '#B47676',
          showLoaderOnConfirm: true,
          preConfirm: () => {
            const email = document.getElementById('txtEmail').value;
            const password = document.getElementById('txtPass').value;
            var data = {}
            data.email = email;
            data.password = password;
            
            let uri = "http://saferusbackend.herokuapp.com/authenticated";

            let h = new Headers();
            h.append('Accept', 'application/json');
            let encoded = window.btoa(`${email}:${password}`);
            let auth = 'Basic ' + encoded;
            localStorage.setItem("auth", auth);
            h.append('Content-Type', 'application/json');
            h.append('Authorization', 'Basic ' + encoded);
            h.append('Origin', 'https://saferus.herokuapp.com');

            //console.log(auth);

            let req = new Request(uri, {
               method: 'GET',
               headers: h,
             });
            //credentials: 'same-origin'

            return fetch(`${urlBase}/authenticated`, {
                headers: {
                  "Authorization": auth
                }
              })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                }
                else {
                  throw new Error('Ocorreu um erro ao tentar iniciar sessão. Por favor verifique se o seu email e a sua password estão corretos. Verifique também se ativou a sua conta através do email que continha a password. Obrigado');
                }
              }).catch(error => {
                swal.showValidationError(`${error}`);
              });
          },
          allowOutsideClick: () => !swal.isLoading()
        })
        .then(result => {
          if (result.value) {
            swal({ title: "Autenticação feita com sucesso!", confirmButtonColor: '#EB586F' });
            localStorage.setItem("user", result.value.nif);
            console.log(document.cookie);
            readuser();
            if (result.value.type == "USER") {
             window.location.href = "./Backoffice/user.html"
            }
            if (result.value.type == "BROKER") {
            window.location.href = "./Backoffice/broker.html"
            }
          }
          else {
            swal({
              title: `Ocorreu um erro ao tentar iniciar sessão. Tente novamente mais tarde!`,
              confirmButtonColor: '#EB586F'
            });
          }
        });
    });
  }


  //Registo 
  btnRegisto.addEventListener("click", () => {
    let nif = "";
    const generatedpassword = generatePassword();
    Swal.queue([{
      title: 'Registo',
      confirmButtonText: 'Avançar',
      confirmButtonColor: '#B47676',
      text: 'Comece por nos indicar o seu NIF',
      showLoaderOnConfirm: true,
      input: 'text',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'É necessário preencher este campo!'
        }
        if (value.length != 9) {
          return 'Escreva um NIF válido!'
        }
      },
      preConfirm: (value) => {
        nif = value;
        return fetch(`https://cors-anywhere.herokuapp.com/https://www.nif.pt/?json=1&q=${nif}&key=28c73ae51a273a898c515915dcf8eb24`)
          .then(response => {
            if (!response.ok) {
              throw new Error("Erro");
            }
            return response.json()
          })
          .then(data => {
            if (data.nif_validation) {
              if (nif.charAt(0) == "5") {
                Swal.insertQueueStep({
                  title: "Registo",
                  html: `<p>Preencha os dados abaixo<p> 
                        <form>
                        <input id="txtFirstName" class="swal2-input" placeholder="Nome" required>
                        <input type="email" id="txtEmail" class="swal2-input" placeholder="E-mail">
                        </form>`,
                  showCancelButton: true,
                  confirmButtonText: "Registar",
                  confirmButtonColor: '#B47676',
                  cancelButtonText: "Cancelar",
                  showLoaderOnConfirm: true,
                  preConfirm: () => {
                    let data = {}
                    data.firstname = document.getElementById('txtFirstName').value;
                    data.lastname = "";
                    data.email = document.getElementById('txtEmail').value;
                    data.password = generatedpassword;
                    data.nif = nif;
                    return fetch(`${urlBase}/signup/broker`, {
                        headers: {
                          "Content-Type": "application/json"
                        },
                        method: "POST",
                        body: JSON.stringify(data)
                      })
                      .then(response => {
                        if (!response.ok) {
                          throw new Error(response.statusText);
                        }
                        return fetch(`${urlBase}/emails`, {
                            headers: { "Content-Type": "application/json" },
                            method: 'POST',
                            body: JSON.stringify(data)
                          })
                          .then(response1 => {
                            if (!response1.ok) {
                              throw new Error(response.statusText);
                            }
                            swal({
                              title: "Inscrição efetuada com sucesso! Receberá no seu email a palavra-passe para aceder à sua área privada.",
                              confirmButtonColor: '#B47676'
                            }).then(() => {
                              window.location.reload();
                            })
                          })
                      })
                      .catch(error => {
                        swal.showValidationError(`Request failed: ${error}`);
                      });
                  },
                  allowOutsideClick: () => !swal.isLoading()
                })
              }
              else {
                Swal.insertQueueStep({
                  title: "Registo",
                  html: `<p>Preencha os dados abaixo<p> 
                        <form>
                        <input id="txtFirstName" class="swal2-input" placeholder="Primeiro nome" required>
                        <input id="txtLastName" class="swal2-input" placeholder="Último nome" required>
                        <input type="email" id="txtEmail" class="swal2-input" placeholder="E-mail">
                        </form>`,
                  showCancelButton: true,
                  confirmButtonText: "Registar",
                  confirmButtonColor: '#B47676',
                  cancelButtonText: "Cancelar",
                  showLoaderOnConfirm: true,
                  preConfirm: () => {
                    let data = {}
                    data.firstname = document.getElementById('txtFirstName').value;
                    data.lastname = document.getElementById('txtLastName').value;
                    data.email = document.getElementById('txtEmail').value;
                    data.password = generatedpassword;
                    data.nif = nif;
                    return fetch(`${urlBase}/signup/user`, {
                        headers: {
                          "Content-Type": "application/json"
                        },
                        method: "POST",
                        body: JSON.stringify(data)
                      })
                      .then(response => {
                        if (!response.ok) {
                          throw new Error(response.statusText);
                        }
                        return fetch(`${urlBase}/emails`, {
                            headers: { "Content-Type": "application/json" },
                            method: 'POST',
                            body: JSON.stringify(data)
                          })
                          .then(response1 => {
                            if (!response1.ok) {
                              throw new Error(response.statusText);
                            }
                            swal({
                              title: "Inscrição efetuada com sucesso! Receberá no seu email a palavra-passe para aceder à sua área privada.",
                              confirmButtonColor: '#B47676'
                            }).then(() => {
                              window.location.reload();
                            })
                          })
                      })
                      .catch(error => {
                        swal.showValidationError(`Request failed: ${error}`);
                      });
                  },
                  allowOutsideClick: () => !swal.isLoading()
                })
              }
            }
            else {
              throw new Error("Erro");
            }
          })
          .catch(() => {
            Swal.insertQueueStep({
              type: 'error',
              title: 'Não foi possível verificar o seu NIF. Por favor tente novamente mais tarde!',
              confirmButtonColor: '#B47676'
            })
          })
      }
    }])
  })

  function generatePassword() {
    const length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return retVal;
  }

}
