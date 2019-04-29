const urlBaseSQL = "https://saferusbackend.herokuapp.com";
const idBroker = localStorage.getItem("idUser");
const auth = localStorage.getItem("auth");

window.onload = () => {
    document.getElementById("seeStatistics").style.display = "none";
    document.getElementById("seeStatisticsUsers").style.display = "none";

    //nome e seguradora
    const dadosMediador = document.getElementById("nomeSegMed");

    //estatísticas 
    const numeroClientes = document.getElementById('numeroClientes');
    const numeroVeiculos = document.getElementById('numeroVeiculos');
    const numeroPedidos = document.getElementById('numeroPedidos');
    const numeroKms = document.getElementById('numeroKms');

    //tabela do menu Estatisticas dos Clientes
    const readVeiculosSegurados = document.getElementById('veiculosSegurados');
    //só faz estas duas se carregar no botao + (estatisticas)
    const readViagensClientes = document.getElementById('viagensClientes');

    //tabela do menu Pedidos de Vinculação
    const readPedidosVinculacao = document.getElementById('pedidosVinculacao');
    //só faz estas duas se carregar no botao + (estatisticas)
    const readViagensUsers = document.getElementById('viagensUsers');


    //CONFIRMAR COM O LUCASSSSSSSSSSSSSSSSSSSSSSSSS                  IMPORTANTE
    //numero total kms percorridos dos clientes
    const numberkms = async() => {
        const response = await fetch(`${urlBaseSQL}/statistics/kms`, {
            headers: {
                "Authorization": auth
            }
        }); //falta URL   
        let numero = 0;
        if (response.status === 200) {
            const kms = await response.json();
            numero = kms[0].numberkms; //funcao que vem do backend
        }
        numeroKms.innerHTML = numero;
    }
    //numero total de clientes
    async function numberClients() {
        const response = await fetch(`${urlBaseSQL}/read/all/clients/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        });
        let numero = 0;
        if (response.status === 200) {
            const clientes = await response.json();
            numero = clientes.length; //funcao que vem do backend
        }
        numeroClientes.innerHTML = numero;
    }
    numberClients()
    //numero total de pedidos de vinculaçao
    async function numberRequests() {
        const response = await fetch(`${urlBaseSQL}/bind/request/pending/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        }); //falta URL   
        let numero = 0;
        if (response.status === 200) {
            const pedidos = await response.json();
            // numero = pedidos[0].numberRequests;                     //funcao que vem do backend
            numero = pedidos.length;
        }
        numeroPedidos.innerHTML = numero;
    }
    numberRequests()
    //numero total de veiculos vinculados
    async function numberVeicules() {
        const response = await fetch(`${urlBaseSQL}/read/bound/vehicles/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        }); //falta URL   
        let numero = 0;
        if (response.status === 200) {
            const veiculos = await response.json();
            //numero = veiculos[0].numberVeicules;                     //funcao que vem do backend
            numero = veiculos.length;
        }
        numeroVeiculos.innerHTML = numero;
    }
    numberVeicules();

    //DADOS
    const renderDadosMediador = async() => {

        const response = await fetch(`${urlBaseSQL}/authenticated`, {
            headers: {
                'Authorization': auth
            }
        });

        if (response.status == 200) {
            const broker = await response.json();
            let txt = `${broker.firstname} ${broker.lastname}`;
            dadosMediador.innerHTML = txt;
        }
        else {
            swal({
                title: 'Ocorreu um erro ao carregar os seus dados. Tente novamente!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            })

        }
    }
    renderDadosMediador();

    //INICIO MEU ESTATISTICAS CLIENTES
    async function renderEstatisticasClientes() {
        let txt = `<thead>
                    <tr>
                      <th class="centered"><i class="fa fa-user"></i> Cliente</th>
                      <th class="centered"><i class="fa fa-id-card-o"></i> NIF</th>
                      <th class="centered"><i class="fa fa-car"></i> Matrícula</th>
                      <th class="centered"><i class="fa fa-bookmark"></i> Marca</th>
                      <th class="centered"><i class=" fa fa-eye"></i> Estatísticas</th>
                      <th class="centered"></th>
                    </tr>
                  </thead>
                  <tbody>`;

        const response1 = await fetch(`${urlBaseSQL}/read/all/clients/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        });
        const response2 = await fetch(`${urlBaseSQL}/read/bound/vehicles/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        });
        if (response1.status == 200) {
            const users = await response1.json();
            if (response2.status == 200) {
                const veicules = await response2.json();
                for (const user of users) {
                    for (const veicule of veicules) {
                        if (user.nif == veicule.user.nif) {
                            txt += `<tr>
                                            <td>${user.firstname} ${user.lastname}</td>
                                            <td>${user.nif}</td>
                                            <td>${veicule.plate}</td>
                                             <td>${veicule.brand}</td>
                                             <td><button id="${veicule.id}" class="btn-table btn-xs estatisticas"><i class="fa fa-plus"></i></button></td>
                                             <td> <button class="btn btn-danger btn-xs desvincular" id="${veicule.id}"><i class=" fa fa-remove"></i>Desvincular</button></td>
                                    </tr>`;
                        }
                    }
                }

                txt += `</tbody>`;
                readVeiculosSegurados.innerHTML = txt;
            }
        }
        else {
            swal({
                title: 'Não existem informações para mostrar!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            });
            logout();
        }


        //gerir clique no botao + em estatisticas
        const btnEstatisticas = document.getElementsByClassName("estatisticas");
        for (let i = 0; i < btnEstatisticas.length; i++) {
            btnEstatisticas[i].addEventListener("click", async() => {
                const response = await fetch(`${urlBaseSQL}/readAllVehicles`, {
                    headers: {
                        'Authorization': auth
                    }
                }); //falta url de todos os veiculos registados
                if (response.status == 200) {
                    const veicules = await response.json();
                    for (const veicule of veicules) {
                        if (veicule.id == btnEstatisticas[i].getAttribute('id')) {
                            const response1 = await fetch(`${urlBaseSQL}/trip/read/data/${veicule.id}`); //outro servidor- VITOR TRATA DISTO
                            if (response1.status == 200) {
                                const viagens = await response1.json();
                                let txt = `<table class="table table-striped table-advance table-hover centered">
                                          <thead>
                                            <tr>
                                              <th class="centered"><i class="fa fa-calendar"></i> Data</th>
                                              <th class="centered"><i class="fa fa-clock-o"></i> Hora</th>
                                              <th class="centered"><i class="fa fa-bookmark"></i> Origem</th>
                                              <th class="centered"><i class=" fa fa-bookmark"></i> Destino</th>
                                              <th class="centered"><i class=" fa fa-hourglass-1"></i> Tempo</th>
                                              <th class="centered"><i class=" fa fa-map"></i> Distância</th>
                                              <th class="centered"><i class=" fa fa-car"></i> Velocidade média</th>
                                              <th class="centered"><i class=" fa fa-bolt"></i> Excesso velocidade</th>
                                            </tr>
                                          </thead>
                                          <tbody>`;
                                for (const viagem of viagens) {
                                    let origin;
                                    const geocoder = new google.maps.Geocoder;
                                    geocoder.geocode({ 'location': { lat: viagem.latitudeStart, lng: viagem.longitudeStart } }, function(results, status) {
                                        if (status === "OK") {
                                            if (results[0]) {
                                                origin = results[0].formatted_address;
                                            }
                                        }
                                    })

                                    let destiny;
                                    geocoder.geocode({ 'location': { lat: viagem.latitudeFinish, lng: viagem.longitudeFinish } }, function(results, status) {
                                        if (status === "OK") {
                                            if (results[0]) {
                                                destiny = results[0].formatted_address;
                                            }
                                        }
                                    })
                                    i++;
                                    const date = new Date(viagem.startDate);
                                    const dateStart = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                                    const hour = date.getHours() + ":" + date.getMinutes();
                                    txt1 += `<tr>
                                   <td>${dateStart}</td>
                                   <td>${hour}</td>
                                   <td>${origin}</td>
                                   <td>${destiny}</td>
                                   <td>${viagem.tripTime} min</td>
                                   <td>${viagem.distance} km</td>
                                   <td>${viagem.velocityAverage} km/h</td>
                                   <td>${viagem.aboveVelocityLimitTime} % do tempo</td>
                                 </tr>`;
                                }
                                readViagensClientes = txt + "</tbody></table>";
                                document.getElementById("seeStatistics").style.display = "block";
                            }
                            else {
                                swal({
                                    title: 'Não existem estatísticas para apresentar!',
                                    type: 'warning',
                                    showCloseButton: false,
                                    focusConfirm: false,
                                    confirmButtonText: 'Sair',
                                    confirmButtonColor: '#B47676'
                                });
                            }
                        }
                    }
                }
            });
        }

        //gerir clique no botao desvincular
        const btnDesvincular = document.getElementsByClassName("desvincular");

        for (let i = 0; i < btnDesvincular.length; i++) {
            btnDesvincular[i].addEventListener("click", () => {
                swal({
                    title: 'Tem a certeza?',
                    text: "Não será possível reverter a desvinculação!",
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#B47676',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Cancelar',
                    confirmButtonText: 'Desvincular'
                }).then(async(result) => {
                    if (result.value) {
                        const plate = btnDesvincular[i].getAttribute("id");
                        try {
                            const response = await fetch(`${urlBaseSQL}/unbind/vehicle/${plate}`, {
                                headers: {
                                    'Authorization': auth
                                },
                                method: "PUT"
                            });
                            if (response.status == 200) {
                                swal({
                                    title: 'Veículo desvinculado com sucesso!',
                                    type: 'success',
                                    showCloseButton: false,
                                    focusConfirm: false,
                                    confirmButtonColor: '#B47676',
                                    timer: 1500
                                });
                                renderEstatisticasClientes();
                            }

                        }
                        catch (err) {
                            swal({
                                type: 'error',
                                title: 'Erro',
                                confirmButtonColor: '#B47676',
                                text: err
                            });
                        }
                        renderEstatisticasClientes();
                    }
                });
            });
        }
    }
    renderEstatisticasClientes();
    //FIM MENU ESTATISTICAS CLIENTES

    //INICIO MENU PEDIDOS DE VINCULAÇAO
    async function renderPedidosVinculacao() {
        let txt = `<thead>
                      <tr>
                        <th class="centered"><i class="fa fa-user"></i> Nome</th>
                        <th class="centered"><i class="fa fa-id-card-o"></i> NIF</th>
                        <th class="centered"><i class="fa fa-car"></i> Matrícula</th>
                        <th class="centered"><i class="fa fa-bookmark"></i> Marca</th>
                        <th class="centered"><i class=" fa fa-eye"></i> Estatísticas</th>
                        <th class="centered"></th>
                      </tr>
                    </thead>
                    <tbody>`;

        const response = await fetch(`${urlBaseSQL}/bind/request/pending/${idBroker}`, {
            headers: {
                'Authorization': auth
            }
        });
        const response1 = await fetch(`${urlBaseSQL}/readAllBrokers`, {
            headers: {
                'Authorization': auth
            }
        });
        const response2 = await fetch(`${urlBaseSQL}/readAllVehicles`, {
            headers: {
                'Authorization': auth
            }
        }); //FALTA ROTA QUE LE TODOS OS VEICULOS

        if (response.status == 200) {
            const pedidos = await response.json();
            console.log(pedidos);
            if (response1.status == 200) {
                const users = await response1.json();
                console.log(users);
                if (response2.status == 200) {
                    const veicules = await response2.json();
                    console.log(veicules);
                    for (const pedido of pedidos) {
                        //for (const user of users) {
                        //  for (const veicule of veicules) {
                        txt += `<tr>
                                <td>${pedido.user.firstname} ${pedido.user.lastname}</td>
                                <td>${pedido.user.nif}</td>
                                <td>${pedido.vehicle.plate}</td>
                                <td>${pedido.vehicle.brand}</td>
                                <td></td>
                                <td> <button id="${pedido.vehicle.id}" class="btn-table btn-xs estatisticas"><i class="fa fa-plus"></i></button></td>
                                <td>
                                  <button class="btn btn-success btn-xs aceitarVinculacao" id="${pedido.id}"><i class="fa fa-check"></i></button>
                                  <button class="btn btn-danger btn-xs recusarVinculacao" id="${pedido.id}"><i class="fa fa-remove"></i></button>
                                </td>
                              </tr>`;

                        //}
                        //}
                    }
                    txt += `</tbody>`;
                    readPedidosVinculacao.innerHTML = txt;
                }
                else {
                    console.log("1");
                }
            }
            else {
                console.log("2");
            }
        }
        else {
            console.log("3");
        }

        //gerir clique no botao + para mostrar as estatisticas dos users
        const btnEstatisticas = document.getElementsByClassName("estatisticas");
        for (let i = 0; i < btnEstatisticas.length; i++) {
            btnEstatisticas[i].addEventListener("click", async() => {
                const response = await fetch(`${urlBaseSQL}/readAllVehicles`, {
                    headers: {
                        'Authorization': auth
                    }
                }); //falta url de todos os veiculos registados
                if (response.status == 200) {
                    const veicules = await response.json();
                    for (const veicule of veicules) {
                        if (veicule.id == btnEstatisticas[i].getAttribute('id')) {
                            const response1 = await fetch(`/${urlBaseSQL}/trip/read/datas/${veicule.id}`); //outro servidor- VITOR TRATA DISTO
                            if (response1.status == 200) {
                                const viagens = await response1.json();
                                let txt = `<table class="table table-striped table-advance table-hover centered">
                                          <thead>
                                            <tr>
                                              <th class="centered"><i class="fa fa-calendar"></i> Data</th>
                                              <th class="centered"><i class="fa fa-clock-o"></i> Hora</th>
                                              <th class="centered"><i class="fa fa-bookmark"></i> Origem</th>
                                              <th class="centered"><i class=" fa fa-bookmark"></i> Destino</th>
                                              <th class="centered"><i class=" fa fa-hourglass-1"></i> Tempo</th>
                                              <th class="centered"><i class=" fa fa-map"></i> Distância</th>
                                              <th class="centered"><i class=" fa fa-car"></i> Velocidade média</th>
                                              <th class="centered"><i class=" fa fa-bolt"></i> Excesso velocidade</th>
                                            </tr>
                                          </thead>
                                          <tbody>`;
                                for (const viagem of viagens) {
                                    let origin;
                                    const geocoder = new google.maps.Geocoder;
                                    geocoder.geocode({ 'location': { lat: viagem.latitudeStart, lng: viagem.longitudeStart } }, function(results, status) {
                                        if (status === "OK") {
                                            if (results[0]) {
                                                origin = results[0].formatted_address;
                                            }
                                        }
                                    })

                                    let destiny;
                                    geocoder.geocode({ 'location': { lat: viagem.latitudeFinish, lng: viagem.longitudeFinish } }, function(results, status) {
                                        if (status === "OK") {
                                            if (results[0]) {
                                                destiny = results[0].formatted_address;
                                            }
                                        }
                                    })
                                    i++;
                                    const date = new Date(viagem.startDate);
                                    const dateStart = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                                    const hour = date.getHours() + ":" + date.getMinutes();
                                    txt += `<tr>
                                   <td>${dateStart}</td>
                                   <td>${hour}</td>
                                   <td>${origin}</td>
                                   <td>${destiny}</td>
                                   <td>${viagem.tripTime} min</td>
                                   <td>${viagem.distance} km</td>
                                   <td>${viagem.velocityAverage} km/h</td>
                                   <td>${viagem.aboveVelocityLimitTime} % do tempo</td>
                                 </tr>`;
                                }
                                readViagensUsers = txt + "</tbody></table>";
                                document.getElementById("seeStatisticsUsers").style.display = "block";
                            }
                            else {
                                swal({
                                    title: 'Não existem estatísticas para apresentar!',
                                    type: 'warning',
                                    showCloseButton: false,
                                    focusConfirm: false,
                                    confirmButtonText: 'Sair',
                                    confirmButtonColor: '#B47676'
                                });
                            }
                        }
                    }
                }
            });
        }

        //gerir clique no botao aceitar vinculaçao                                                   
        const btnAceitar = document.getElementsByClassName("aceitarVinculacao");

        for (let i = 0; i < btnAceitar.length; i++) {
            btnAceitar[i].addEventListener("click", () => {
                swal({
                    text: `Tem a certeza que deseja aceitar este pedido de vinculação?,
                         'Se sim, insira no campo abaixo o código do contrato e contacte o cliente! Obrigado!`,
                    html: `<form>
                             <input type="text" id="contrato" class="swal2-input">
                           </form>`,
                    type: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#B47676',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Cancelar',
                    confirmButtonText: 'Aceitar',
                    showLoaderOnConfirm: true,
                    preConfirm: () => {

                        const contrato = document.getElementById("contrato").value;
                        console.log(contrato)
                        var data = {}
                        data.contractCode = contrato;
                        return fetch(`${urlBaseSQL}/validate/bind/${btnAceitar[i].getAttribute('id')}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': auth
                            },
                            method: 'PUT',
                            body: JSON.stringify(data)
                        }).then(response => {
                            if (!response.ok) {
                                throw new Error(response.statusText);
                            }
                            renderPedidosVinculacao();
                            return response.json();
                        }).catch(error => {
                            swal.showValidationError(`Pedido Falhou: ${error}`);
                        });
                    },
                    allowOutsideClick: () => !swal.isLoading()
                })
            })
        }

        //gerir clique no botao recusar vinculaçao
        const btnRecusar = document.getElementsByClassName("recusarVinculacao");

        for (let i = 0; i < btnRecusar.length; i++) {
            btnRecusar[i].addEventListener("click", () => {
                swal({
                    title: 'Tem a certeza?',
                    text: "Não será possível reverter caso recuse o pedido de vinculação!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#B47676',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Cancelar',
                    confirmButtonText: 'Remover'
                }).then(async(result) => {
                    if (result.value) {
                        const pedidoId = btnRecusar[i].getAttribute('id');
                        try {
                            const response = await fetch(`${urlBaseSQL}/unvalidate/bind/${pedidoId}`, { //FALTA A ROTA PARA RECUSAR VINCULAÇAO
                                headers: {
                                    'Authorization': auth
                                },
                                method: "PUT"
                            });
                            if (response.status == 200) {
                                swal({
                                    title: 'Pedido de vinculação recusado!',
                                    type: 'success',
                                    confirmButtonColor: '#B47676'
                                });
                                renderPedidosVinculacao();
                            }

                        }
                        catch (err) {
                            swal({
                                type: 'error',
                                title: 'Recusar vinculação',
                                confirmButtonColor: '#B47676',
                                text: err
                            });
                        }
                    }
                });
            });
        }
    }
    renderPedidosVinculacao();
    //FIM MENU PEDIDOS DE VINCULAÇAO

    //INICIO MENU EDITAR PERFIL
    //alterar perfil - dados
    const btnMenuEditar = document.getElementById("editMenu");

    //só para preencher o form do editar
    btnMenuEditar.onclick = async() => {
        const response = await fetch(`${urlBaseSQL}/authenticated`, {
            headers: {
                'Authorization': auth
            }
        });

        if (response.status == 200) {
            const user = await response.json();

            document.getElementById("firstname").value = user.firstname;
            const date = new Date(user.birthDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            if (day < 10 && month > 9) {
                document.querySelector('input[type="date"]').value = `${year}-${month}-0${day}`;
            }
            else if (day > 10 && month < 9) {
                document.querySelector('input[type="date"]').value = `${year}-0${month}-${day}`;
            }
            else if (day < 10 && month < 10) {
                document.querySelector('input[type="date"]').value = `${year}-0${month}-0${day}`;
            }
            else {
                document.querySelector('input[type="date"]').value = `${year}-${month}-${day}`;
            }
            document.getElementById("phone").value = user.contact;
            document.getElementById("email").value = user.email;
            document.getElementById("address").value = user.address;
            document.getElementById("cp").value = user.zipCode;
            document.getElementById("city").value = user.city;
            document.getElementById("country").value = user.country;
        }
        document.getElementById("clientStatistics").className = "tab-pane";
        document.getElementById("requests").className = "tab-pane";
        document.getElementById("edit").className = "tab-pane active";
        window.location.href = "#edit";
    }

    const btnGuardarDados = document.getElementById("guardarDados");

    btnGuardarDados.addEventListener("submit", async(event) => {
        let data = {}

        data.firstname = document.getElementById("firstname").value;
        data.lastname = "";
        data.birthDate = new Date(document.querySelector('input[type="date"]').value).toJSON()
        data.contact = document.getElementById("phone").value;
        data.email = document.getElementById("email").value;
        data.address = document.getElementById("address").value;
        data.zipCode = document.getElementById("cp").value;
        data.city = document.getElementById("city").value;
        data.country = document.getElementById("country").value
        data.insuranceCompany = "";
        data.nif = 0;
        data.password = 0;

        const response = await fetch(`${urlBaseSQL}/update/broker/${idBroker}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (response.status == 200) {
            swal({
                title: 'Alteração efetuada com sucesso!',
                type: 'success',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonColor: '#B47676',
                timer: 1500
            }).then(window.location.reload());
        }
        else {
            swal({
                title: 'Preencha corretamente os campos!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            })
        }
    })

    //alterar palavra-passe
    const btnAlterarPass = document.getElementById("alterarPass");

    btnAlterarPass.addEventListener("click", async() => {

        const pass = document.getElementById("psw1").value;
        const confPass = document.getElementById("psw2").value;

        if (pass == confPass) {
            let data = {};
            data.password = pass;
            data.email = 0;
            data.firstname = 0;
            data.lastname = 0;
            data.nif = 0;

            const response = await fetch(`${urlBaseSQL}/update/password/${idBroker}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                },
                method: 'PUT',
                body: JSON.stringify(data)
            });
            if (response.status == 200) {
                swal({
                    title: 'Alteração efetuada com sucesso!',
                    type: 'success',
                    showCloseButton: false,
                    focusConfirm: false,
                    confirmButtonColor: '#B47676',
                    timer: 1500
                }).then(logout());
            }
            else {
                swal({
                    title: 'Ocorreu um erro! Tente novamente!',
                    type: 'warning',
                    showCloseButton: false,
                    focusConfirm: false,
                    confirmButtonText: 'Sair',
                    confirmButtonColor: '#B47676'
                })
            }
        }
        else {
            swal({
                title: 'As passwords não correspondem!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            })
        }
    });
    //FIM MENU EDITAR PERFIL
    function logout() {
        localStorage.removeItem("idUser");
        localStorage.removeItem("Auth");
        window.location.replace("./../index.html");
    }
    //LOGOUT
    const btnLogout = document.getElementById('logoutBroker');
    btnLogout.addEventListener("click", function() {
        logout();
    });
}
