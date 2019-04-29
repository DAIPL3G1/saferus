const urlBaseSQL = "https://saferusbackend.herokuapp.com";
const urlBaseMongo = "https://saferusmongo.herokuapp.com";
const idUser = localStorage.getItem('user');
const auth = localStorage.getItem("auth")

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

let directionsService;
let directionsDisplay;

function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: { lat: 41.4435606, lng: -8.336234200000002 }
    });
    directionsDisplay.setMap(map);
}

async function calculateAndDisplayRoute(directionsService, directionsDisplay, idVehicle) {
    let inicio, fim;
    let waypts = [];
    const response = await fetch(`${urlBaseMongo}/api/data/${idVehicle}`, {
        headers: {
            "Authorization": auth
        }
    });
    const positions = await response.json();
    for (const position of positions) {
        if (position.start) {
            inicio = {
                lat: position.latitude,
                lng: position.longitude
            }
            return;
        }
        if (position.finish) {
            fim = {
                lat: position.latitude,
                lng: position.longitude
            }
            return;
        }
        waypts.push({
            location: {
                lat: position.latitude,
                lng: position.longitude
            },
            stopover: true
        });
    }
    //waypts = [{ location: { lat: 41, lng: -8.336234200000002 }, stopover: true }, { location: { lat: 41.4435606, lng: -8 }, stopover: true }];

    directionsService.route({
        origin: inicio,
        destination: fim,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                    '</b><br>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
            }
        }
        else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

window.onload = () => {

    document.getElementById("seeStatistics").style.display = "none";

    //dados Pessoais
    const nomeUser = document.getElementById("nomeUser");
    const dadosPessoais = document.getElementById("dadosPessoais");

    //estatísticas
    const numeroVeiculos = document.getElementById('numeroVeiculos');
    const numeroKmsPerc = document.getElementById('numeroKmsPerc');
    const numeroPontosAc = document.getElementById('numeroPontosAc');

    //tabelas no menu estatísticas
    const readVeiculosReg = document.getElementById('veiculosReg');
    //só faz estas duas se carregar no botao + (estatisticas)
    const readUltimaViagem = document.getElementById('ultimaViagem');
    const readViagensAnteriores = document.getElementById('viagensAnteriores');

    //veículos
    const readVeiculos = document.getElementById('veiculos');
    //formulario de adicionar veiculos
    const formAddVeicules = document.getElementById('formAddVeicules');


    //FALTA ESTAS ESTATISTICASSSSSS  - CONFIRMAR CODIGO DEPOIS
    //numero veiculos
    async function numberVeicules() {
        let numero = 0;
        const response = await fetch(`${urlBaseSQL}/read/user/vehicles/${idUser}`, {
            headers: {
                "Authorization": auth
            }
        })
        if (response.status == 200) {
            const veicules = await response.json();
            //numero = veicules[0].numberVeicules; //funcao parte backend que conta o numero de veiculos  //falta
            numero = veicules.length;
        }

        numeroVeiculos.innerHTML = numero;
    }
    numberVeicules();

    //numero total kms percorridos
    const numberkmsPerc = async() => {
        const response = await fetch(`${urlBaseSQL}/statistics/kms`, {
            headers: {
                "Authorization": auth
            }
        }); //falta URL
        let numero = 0;
        if (response.status == 200) {
            const kms = await response.json();
            numero = kms[0].numberkmsPerc;
        }
        numeroKmsPerc.innerHTML = numero;
    }

    //numero de pontos acumulados
    const numberPoints = async() => {
        const response = await fetch(`${urlBaseSQL}/statistics/points`, {
            headers: {
                "Authorization": auth
            }
        }); //url falta
        let numero = 0;
        if (response.status == 200) {
            const points = await response.json();
            numero = points[0].numberPoints;
        }
        numeroPontosAc.innerHTML = numero;
    }
    numberVeicules();
    numberkmsPerc();
    numberPoints();

    //DADOS UTILIZADOR
    const renderDados = async() => {

        const response = await fetch(`${urlBaseSQL}/authenticated`, {
            headers: {
                "Authorization": auth
            }
        });
        if (response.status == 200) {
            const user = await response.json();
            console.log(user)
            let txt = `${user.firstname} ${user.lastname}`;
            let txt1 = `<div class="col-md-6">
                  <br>`;
            if (user.birthDate != null && user.birthDate != undefined) {
                const birthDate = formatDate(new Date(user.birthDate));
                txt1 += `<h5>Data de Nascimento: ${birthDate}</h5>`;
            }
            else {
                txt1 += '<h5>Data de Nascimento:</h5>';
            }
            txt1 += `<h5>NIF: ${user.nif}</h5>
                    <h5>Email: ${user.email}</h5>`
            if (user.contact != null && user.contact != undefined) {
                txt1 += `<h5>Contacto: ${user.contact}</h5>`;
            }
            else {
                txt1 += '<h5>Contacto:</h5>';
            }
            txt1 += `</div>
                <!-- /col-md-4 -->
                <div class="col-md-6">
                  <br>`
            if (user.address != null && user.address != undefined) {
                txt1 += `<h5>Morada: ${user.address}</h5>`;
            }
            else {
                txt1 += `<h5>Morada:</h5>`;
            }
            if (user.zipCode != null && user.zipCode != undefined) {
                txt1 += `<h5>CP: ${user.zipCode}</h5>`
            }
            else {
                txt1 += `<h5>CP:</h5>`
            }
            if (user.city != null && user.city != undefined) {
                txt1 += `<h5>Cidade: ${user.city}</h5>
                            </div>`
            }
            else {
                txt1 += `<h5>Cidade:</h5>
                            </div>`
            }

            nomeUser.innerHTML = txt;
            dadosPessoais.innerHTML = txt1;
        }
        else {
            swal({
                title: 'Ocorreu um erro ao carregar os seus dados. Tente novamente!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: true,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            }).then(logout());
        }
    }
    renderDados();

    //FIM DADOS UTILIZADORES

    //ÍNICIO MENU ESTATISTICAS
    const renderVeiculosRegistados = async() => {
        const response = await fetch(`${urlBaseSQL}/read/user/vehicles/${idUser}`, {
            headers: {
                'Authorization': auth
            }
        }) //falta url de todos os veiculos registados
        if (response.status == 200) {
            const veicules = await response.json();
            let txt = `<thead>
                              <tr>
                                <th class="centered"><i class="fa fa-car"></i> Matrícula</th>
                                <th class="centered"><i class="fa fa-bookmark"></i> Marca</th>
                                <th class="centered"><i class="fa fa-map"></i> Kms na App</th>
                                <th class="centered"><i class=" fa fa-file-text-o"></i> Vinculado</th>
                                <th class="centered"><i class=" fa fa-eye"></i> Estatísticas</th>
                              </tr>
                            </thead>
                            <tbody>`;

            const response1 = await fetch(`${urlBaseSQL}/readAllBinds`, {
                headers: {
                    'Authorization': auth
                }
            });
            if (response1.status == 200) {
                const binds = await response1.json();
                for (const veicule of veicules) { //os kms do veiculo  e os pontos nao tenho a certeza se é assim
                    let vinculado = false;
                    let pendente = false;
                    console.log(veicule)
                    txt += `<tr>
                                <td>${veicule.plate}</td>
                                <td>${veicule.brand}</td>`
                    const response2 = await fetch(`${urlBaseSQL}/trip/read/datas/${veicule.id}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    if (response2.status == 200) {
                        let kms = 0;
                        const trips = await response2.json();
                        for (const trip of trips) {
                            kms += trip.distance;
                        }
                        txt += `<td>${kms}</td>`;
                    }
                    else {
                        txt += `<td> - </td>`
                    }
                    for (const bind of binds) {
                        if ((bind.vehicle.id == veicule.id)) {
                            pendente = true;
                            if (bind.enabled == 1) {
                                vinculado = true;
                            }
                        }
                    }
                    if (vinculado) {
                        txt += `<td> <span class="label label-success label-mini"><i class="fa fa-check"></i></span></td>`;
                    }
                    else if (pendente) {
                        txt += `<td> <span class="label label-warning label-mini"><i class="fa fa-clock-o"></i></span></td>`;
                    }
                    else {
                        txt += `<td> <span class="label label-warning label-mini"><i class="fa fa-remove"></i></span></td>`;
                    }
                    txt += `<td> <button id="${veicule.id}" class="btn-table btn-xs estatisticas"><i class="fa fa-plus"></i></button></td>
                              </tr>`;
                }
            }
            else if (response1.status == 404) {
                for (const veicule of veicules) {
                    txt += `<tr>
                            <td>${veicule.plate}</td>
                            <td>${veicule.brand}</td>`;
                    const response2 = await fetch(`${urlBaseSQL}/trip/read/datas/${veicule.id}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    if (response2.status == 200) {
                        let kms = 0;
                        const trips = await response2.json();
                        for (const trip of trips) {
                            kms += trip.distance;
                        }
                        txt += `<td>${kms}</td>`;
                    }
                    else {
                        txt += `<td> - </td>`
                    }
                    txt += `<td> <span class="label label-warning label-mini"><i class="fa fa-remove"></i></span></td>
                            <td> <button id="${veicule.plate}" class="btn-table btn-xs estatisticas"><i class="fa fa-plus"></i></button></td>
                          </tr>`;
                }
            }
            else {
                swal({
                    title: 'Não existem veículos registados!',
                    type: 'warning',
                    showCloseButton: false,
                    focusConfirm: false,
                    confirmButtonText: 'Sair',
                    confirmButtonColor: '#B47676'
                })
            }
            txt += `</tbody>`;
            readVeiculosReg.innerHTML = txt;


            //gerir botao estatisticas - ao carregar no mais aparece as ultimas viagens

            const btnEstatisticas = document.getElementsByClassName("estatisticas");
            for (let i = 0; i < btnEstatisticas.length; i++) {
                btnEstatisticas[i].addEventListener("click", async() => {
                    for (const veicule of veicules) {
                        if (veicule.id == btnEstatisticas[i].getAttribute('id')) {
                            const response2 = await fetch(`${urlBaseSQL}/trip/read/datas/${veicule.id}`, {
                                headers: {
                                    "Authorization": auth
                                }
                            }); //outro servidor- VITOR TRATA DISTO
                            if (response2.status == 200) {
                                calculateAndDisplayRoute(directionsService, directionsDisplay, veicule.id);
                                const viagens = await response2.json();
                                let i = 0;
                                let txt = "",
                                    txt1 = `<table class="table table-striped table-advance table-hover centered">
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
                                    if (i == 0) {
                                        i++;
                                        txt += `<h5>Data (final): ${viagem.date}</h5>
                             <h5>Hora: ${viagem.hour}</h5>
                             <h5>Distância: ${viagem.distance} km</h5>
                             <h5>Velocidade média: ${viagem.velocity} km/h</h5>
                             <h5>Excesso de velocidade: ${viagem.excessVelocity} % do tempo</h5>`;
                                    }
                                    else {
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
                                }
                                readUltimaViagem.innerHTML = txt;
                                if (i > 1) {
                                    readViagensAnteriores = txt1 + "</tbody></table>";
                                }
                                document.getElementById("seeStatistics").style.display = "block";
                            }
                            else {
                                swal({
                                    title: 'Não existem estatísticas para apresentar. Escolha um veículo e inicie a viagem!',
                                    type: 'warning',
                                    showCloseButton: false,
                                    focusConfirm: false,
                                    confirmButtonText: 'Sair',
                                    confirmButtonColor: '#B47676'
                                })
                            }
                        }

                    }
                })
            }
        }
    }
    renderVeiculosRegistados();

    //FIM MENU ESTATISTICAS
    //ÍNICIO MENU VEÍCULOS

    //adicionar veículos
    formAddVeicules.addEventListener("submit", async(event) => {
        event.preventDefault();

        let data = {};
        data.plate = document.getElementById("plate").value;
        data.brand = document.getElementById("brand").value;

        const response = await fetch(`${urlBaseSQL}/add/vehicle/${idUser}`, { //NAO TENHO A CERTEZA SE É ESTE O URL
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.status == 200) {
            swal({
                title: 'Veículo inserido com sucesso!',
                type: 'success',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonColor: '#B47676',
                timer: 1500
            })
            renderVeicules();
            renderVeiculosRegistados();
        }
        else {
            swal({
                title: 'Erro! Não foi possível inserir o seu veículo!',
                type: 'warning',
                showCloseButton: false,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            })
        }
        // }
        renderVeicules();
        renderVeiculosRegistados();
    });


    //tabela dos veiculos
    async function renderVeicules() {

        const response = await fetch(`${urlBaseSQL}/read/user/vehicles/${idUser}`, {
            headers: {
                'Authorization': auth
            }
        });
        if (response.status == 200) {
            const veiculesUser = await response.json();
            let txt = `<thead>
                              <tr>
                                <th class="centered"><i class="fa fa-car"></i> Matrícula</th>
                                <th class="centered"><i class="fa fa-bookmark"></i> Marca</th>
                                <th class="centered"><i class=" fa fa-trophy"></i> Vinculado</th>
                                <th class="centered"><i class=" fa fa-play"></i> Viagem</th>
                                <th class="centered"></th>
                              </tr>
                            </thead>
                            <tbody>`;

            const response1 = await fetch(`${urlBaseSQL}/readAllBinds`, {
                headers: {
                    'Authorization': auth
                }
            });
            if (response1.status == 200) {
                const binds = await response1.json();
                for (const veiculeUser of veiculesUser) {
                    let vinculado = false;
                    let pendente = false;
                    txt += `<tr>
                                <td>${veiculeUser.plate}</td>
                                <td>${veiculeUser.brand}</td>`;
                    for (const bind of binds) {
                        if ((bind.vehicle.id == veiculeUser.id)) {
                            pendente = true;
                            if (bind.enabled == 1) {
                                vinculado = true;
                            }
                        }
                    }
                    if (vinculado) {
                        txt += `<td> <span class="label label-success label-mini"><i class="fa fa-check fa-1x"></i> Vinculado</span></td>`;
                    }
                    else if (pendente) {
                        txt += `<td> <span class="label label-warning label-mini"><i class="fa fa-clock-o fa-1x"></i> Pendente</span></td>`
                    }
                    else {
                        txt += `<td> <button id="${veiculeUser.plate}" class="btn btn-warning btn-sm vincular"><i class="fa fa-plus"> Vincular</i></button></td>`;
                    }
                    txt += `<td> <button id="${veiculeUser.id}" class="btn-table btn-sm iniciar">Iniciar</button></td>
                        <td> <button id="${veiculeUser.plate}" class="btn btn-danger btn-sm eliminar"><i class="fa fa-trash-o fa-1x"></i></button></td>
                              </tr>`;
                }
            }
            else if (response1.status == 404) {
                for (const veiculeUser of veiculesUser) {
                    txt += `<tr>
                            <td>${veiculeUser.plate}</td>
                            <td>${veiculeUser.brand}</td>   
                            <td> <button id="${veiculeUser.plate}" class="btn btn-warning btn-sm vincular"><i class=" fa fa-plus"></i> Vincular</i></button></td>   
                            <td> <button id="${veiculeUser.id}" class="btn-table btn-sm iniciar">Iniciar</button></td>
                            <td> <button id="${veiculeUser.plate}" class="btn btn-danger btn-sm eliminar"><i class="fa fa-trash-o fa-1x"></i></button></td>
                        </tr>`;
                }
            }
            else {
                swal({
                    title: 'Erro! Não existem veículos!',
                    type: 'warning',
                    showCloseButton: false,
                    focusConfirm: false,
                    confirmButtonText: 'Sair',
                    confirmButtonColor: '#B47676'
                })
            }
            txt += `</tbody>`;
            readVeiculos.innerHTML = txt;

            //gerir botao para iniciar viagem   --  ao carregar no botao abre um swal a dizer que estao a ser recolhidos os dados e um botao de terminar ..... falta maneira de recolher esses dados 
            //ATENÇÃO VER ESTA PARTE MELHOR  INICIAR VIAGEM
            const btnIniciar = document.getElementsByClassName("iniciar");

            for (let i = 0; i < btnIniciar.length; i++) {
                btnIniciar[i].addEventListener("click", async() => {
                    for (const veiculeUser of veiculesUser) {
                        if (veiculeUser.id == btnIniciar[i].getAttribute('id')) {
                            let dataInicio, dataParcial, acl;
                            let magnitudes = [2];
                            let velocidadeAnterior = 0,
                                datas = [];
                            let start = true;
                            let finish = false;
                            let latitude, longitude;

                            //pedir permissao para aceder ao acelerometro
                            navigator.permissions.query({ name: 'accelerometer' }).then(result => {
                                if (result.state === 'denied') {
                                    alert('Permission to use accelerometer sensor is denied.');
                                    return;
                                }
                                if (!navigator.geolocation) {
                                    alert("Your browser don't suport GeoLocation!");
                                    return;
                                }

                                acl = new Accelerometer({ frequency: 60 });

                                acl.addEventListener('activate', () => console.log('Ready to measure.'));
                                //criacao de variaveis para determinar o tempo que decorreu para calcular velocidade
                                dataInicio = new Date();
                                dataParcial = dataInicio;
                                acl.addEventListener('error', error => console.log(`Error: ${error.name}`));
                                acl.addEventListener('reading', () => {
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        latitude = position.coords.latitude;
                                        longitude = position.coords.longitude;
                                        if (!start) {
                                            magnitudes[0] = magnitudes[1];
                                        }
                                        else {
                                            console.log("1");
                                            magnitudes[0] = 0;
                                            velocidadeAnterior = 0;
                                            let data = {};
                                            data.idVehicle = btnIniciar[i].getAttribute('id');
                                            data.dateTime = (new Date()).toString();
                                            data.speed = "0";
                                            data.start = start.toString();
                                            data.finish = finish.toString();
                                            data.latitude = latitude.toString();
                                            data.longitude = longitude.toString();
                                            data.speedLimit = "0";
                                            datas.push(JSON.stringify(data));
                                            start = false;
                                        }

                                        //ir buscar o valor da aceleracao
                                        let magnitude = Math.hypot(acl.x, acl.y, acl.z);
                                        magnitudes[1] = (parseFloat(magnitude) / 9.81) - 1;
                                        const dataAtual = new Date();
                                        const tempo = (dataAtual - dataParcial) / 1000;
                                        dataParcial = dataAtual;
                                        velocidadeAnterior = ((magnitudes[0] + magnitudes[1]) * (tempo / 2)) + velocidadeAnterior;
                                        let speedLimit = velocidadeAnterior;
                                        console.log("2");
                                        let data = {};
                                        data.idVehicle = btnIniciar[i].getAttribute('id');
                                        data.dateTime = dataAtual.toString();
                                        data.speed = velocidadeAnterior.toString();
                                        data.start = start.toString();
                                        data.finish = finish.toString();
                                        data.latitude = latitude.toString();
                                        data.longitude = longitude.toString();
                                        data.speedLimit = speedLimit.toString();
                                        datas.push(JSON.stringify(data));
                                        sleep(1000);
                                    });
                                });
                                acl.start();
                            });
                            swal({
                                title: '<strong>Os seus dados serão registados. Clique abaixo para terminar a viagem.</u></strong>',
                                focusConfirm: false,
                                confirmButtonText: 'Terminar viagem',
                                confirmButtonColor: '#B47676'
                            }).then(() => {
                                acl.stop();
                                finish = true;
                                //para acelerometro
                                navigator.geolocation.getCurrentPosition((position) => {
                                    let data = {};
                                    data.idVehicle = btnIniciar[i].getAttribute('id');
                                    data.dateTime = (new Date()).toString();
                                    data.speed = "0";
                                    data.start = start.toString();
                                    data.finish = finish.toString();
                                    data.latitude = position.coords.latitude.toString();
                                    data.longitude = position.coords.longitude.toString();
                                    data.speedLimit = "0";
                                    datas.push(JSON.stringify(data));
                                    let err = false;
                                    for (let i = 0; i < datas.length; i++) {
                                        fetch(`${urlBaseMongo}/api/data/`, {
                                            headers: { 'Content-Type': 'application/json' },
                                            method: 'POST',
                                            body: datas[i]
                                        }).then(response => {
                                            console.log(response);
                                            if (!response.ok) {
                                                throw new Error("");
                                            } else {
                                                return response.json();
                                            }
                                        }).then(result => {
                                            datas[i] = result._id;
                                        }).catch(error => {
                                            err = true;
                                            for (let j = i; j < datas.length; j++) {
                                                datas[j] = null;
                                            }
                                            swal({
                                                title: '<strong>Ocorreu um erro na leitura dos seus dados!</strong>',
                                                confirmButtonText: 'Sair',
                                                confirmButtonColor: '#B47676'
                                            });
                                        });
                                    }
                                    if (err) {
                                        for (let j = 0; j < datas.length; j++) {
                                            if (datas[j] != null) {
                                                fetch(`${urlBaseMongo}/api/data/id/${datas[j]}`, {
                                                    method: 'DELETE'
                                                });
                                            }
                                        }
                                    }
                                });
                            })

                            function sleep(ms) {
                                var start = new Date().getTime();
                                for (var i = 0; i < 1e7; i++) {
                                    if (((new Date().getTime() - start) > ms) || finish) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                })
            }

            //gerir clique no botao delete
            const btnEliminar = document.getElementsByClassName("eliminar");

            for (let i = 0; i < btnEliminar.length; i++) {

                btnEliminar[i].addEventListener("click", async() => {
                    const response1 = await fetch(`${urlBaseSQL}/readAllBinds`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    const response2 = await fetch(`${urlBaseSQL}/read/user/vehicles/${idUser}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    if (response1.status == 200 && response2.status == 200) {

                        const binds = await response1.json();
                        const veicules = await response2.json();

                        for (const veicule of veicules) {

                            let vinculado = false;

                            if (binds.length != 0) {
                                for (const bind of binds) {

                                    if (bind.vehicle.id == veicule.id && bind.enabled == 1) {
                                        vinculado = true;
                                    }
                                    if (vinculado) {
                                        swal({
                                            title: 'Contacte o seu mediador para desvincular o seu veículo! Obrigado!',
                                            confirmButtonColor: '#B47676',
                                            type: 'warning'
                                        })
                                    }
                                    else {
                                        swal({
                                            title: 'Tem a certeza que deseja remover este veículo?',
                                            text: "Não será possível reverter a remoção!",
                                            type: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#B47676',
                                            cancelButtonColor: '#d33',
                                            cancelButtonText: 'Cancelar',
                                            confirmButtonText: 'Remover'
                                        }).then(async(result) => {
                                            if (result.value) {
                                                const plate = btnEliminar[i].getAttribute("id");
                                                try {
                                                    const response = await fetch(`${urlBaseSQL}/delete/vehicle/${veicule.id}`, {

                                                        headers: {
                                                            'Authorization': auth
                                                        },
                                                        method: "DELETE"
                                                    });
                                                    if (response.status == 200) {
                                                        swal({
                                                            title: 'Veículo removido com sucesso!',
                                                            type: 'success',
                                                            showCloseButton: false,
                                                            focusConfirm: false,
                                                            confirmButtonColor: '#B47676',
                                                            timer: 1500
                                                        });
                                                        renderVeicules();
                                                        renderVeiculosRegistados();
                                                    }
                                                }
                                                catch (error) {
                                                    swal({
                                                        type: 'error',
                                                        title: 'Erro',
                                                        confirmButtonColor: '#B47676',
                                                        text: error
                                                    });
                                                }
                                                renderVeicules();
                                                renderVeiculosRegistados();
                                            }
                                        });
                                    }
                                }
                            }
                            else {
                                swal({
                                    title: 'Tem a certeza que deseja remover este veículo?',
                                    text: "Não será possível reverter a remoção!",
                                    type: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#B47676',
                                    cancelButtonColor: '#d33',
                                    cancelButtonText: 'Cancelar',
                                    confirmButtonText: 'Remover'
                                }).then(async(result) => {
                                    if (result.value) {
                                        const plate = btnEliminar[i].getAttribute("id");
                                        try {
                                            const response = await fetch(`${urlBaseSQL}/delete/vehicle/${veicule.id}`, {
                                                headers: {
                                                    'Authorization': auth
                                                },
                                                method: "DELETE"
                                            });
                                            if (response.status == 200) {
                                                swal({
                                                    title: 'Veículo Removido com Sucesso!',
                                                    type: 'success',
                                                    showCloseButton: false,
                                                    focusConfirm: false,
                                                    confirmButtonColor: '#B47676',
                                                    timer: 1500
                                                });
                                                renderVeicules();
                                                renderVeiculosRegistados();
                                            }
                                        }
                                        catch (error) {
                                            swal({
                                                type: 'error',
                                                title: 'Erro',
                                                text: error,
                                                confirmButtonColor: '#B47676'
                                            });
                                        }
                                        renderVeicules();
                                        renderVeiculosRegistados();
                                    }
                                });
                            }
                        }
                    }
                });
            }

            //gerir clique no botao vincular, para ele vincular aquele veiculo
            const btnVincular = document.getElementsByClassName("vincular");

            for (let i = 0; i < btnVincular.length; i++) {

                btnVincular[i].addEventListener("click", async() => {
                    for (const veiculeUser of veiculesUser) {
                        if (veiculeUser.plate == btnVincular[i].getAttribute('id')) {
                            const response2 = await fetch(`${urlBaseSQL}/readAllBrokers`, {
                                headers: {
                                    'Authorization': auth
                                }
                            });
                            let txt;
                            let txt1;
                            if (response2.status == 200) {
                                const brokers = await response2.json();
                                for (const broker of brokers) {
                                    txt1 += `<tr><td>${broker.firstname} ${broker.lastname}</td>
                                                 <td>${broker.zip_code}</td>
                                                 <td>${broker.contact}</td></tr>`
                                    txt += `<option id='${broker.nif}' value="${broker.firstname}">${broker.firstname} ${broker.lastname}</option>`;
                                }
                                swal({
                                    title: "Vincular Veículo",
                                    html: `<div><table class="table table-striped table-advance table-hover centered">
                                    <thead>
                              <tr>
                                <th class="centered"><i class="fa fa-user"></i> Nome</th>
                                <th class="centered"><i class="fa fa-home"></i> Código Postal</th>
                                <th class="centered"><i class="fa fa-phone"></i> Contacto</th>
                              </tr>
                            </thead>
                            <tbody>${txt1}
                            </tbody></table></div>
                                    <div><form>
                                            <select name="selectType" id="selectMediador" class="swal2-input" required>
                                                <option value="" selected disabled hidden>Selecione um mediador</option>
                                                ${txt}
                                            </select></form></div>`,
                                    showCancelButton: false,
                                    confirmButtonText: "Vincular",
                                    confirmButtonColor: '#B47676',
                                    cancelButtonText: "Cancelar",
                                    showLoaderOnConfirm: true,
                                    preConfirm: () => {
                                        const selectMediador = document.getElementById("selectMediador");
                                        const mediador = selectMediador.options[selectMediador.selectedIndex].getAttribute("id");
                                        let data = {};
                                        data.id = veiculeUser.id;
                                        return fetch(`${urlBaseSQL}/request/bind/${mediador}/${idUser}`, {
                                            headers: {
                                                "Content-Type": "application/json",
                                                'Authorization': auth
                                            },
                                            method: "POST",
                                            body: JSON.stringify(data)
                                        })
                                    },
                                    allowOutsideClick: () => !swal.isLoading()
                                }).then(result => {
                                    if (result.value) {
                                        if (result.value.ok) {
                                            swal({
                                                title: 'Pedido de vinculação efetuada com sucesso!',
                                                type: 'success',
                                                showCloseButton: false,
                                                focusConfirm: false,
                                                confirmButtonColor: '#B47676',
                                                timer: 1500
                                            })
                                            renderVeicules();
                                            renderVeiculosRegistados();
                                        }
                                        else {
                                            swal({
                                                title: `Occoreu um erro ao tentar vincular o veiculo. Tente mais tarde!`,
                                                confirmButtonColor: '#B47676',
                                                timer: 1500
                                            })
                                        }
                                    }
                                });
                            }
                        }
                    }

                });
            }
        }
    }
    renderVeicules();

    //FIM MENU VEICULOS                           

    //INICIO MENU EDITAR PERFIL
    const btnMenuEditar = document.getElementById("editMenu");

    //só para preencher o form do editar
    btnMenuEditar.onclick = async() => {
        const response = await fetch(`${urlBaseSQL}/authenticated`, {
            headers: { 'Authorization': auth }
        });

        if (response.status == 200) {
            const user = await response.json();

            document.getElementById("firstname").value = user.firstname;
            document.getElementById("lastname").value = user.lastname;
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
        document.getElementById("statistics").className = "tab-pane";
        document.getElementById("veicule").className = "tab-pane";
        document.getElementById("edit").className = "tab-pane active";
        window.location.href = "#edit";
    }

    //alterar perfil - dados
    const btnGuardarDados = document.getElementById("guardarDados");

    btnGuardarDados.addEventListener("submit", async(event) => {
        let data = {}

        data.firstname = document.getElementById("firstname").value;
        data.lastname = document.getElementById("lastname").value;
        data.birthDate = new Date(document.querySelector('input[type="date"]').value).toJSON()
        data.contact = document.getElementById("phone").value;
        data.email = document.getElementById("email").value;
        data.address = document.getElementById("address").value;
        data.zipCode = document.getElementById("cp").value;
        data.city = document.getElementById("city").value;
        data.country = document.getElementById("country").value
        data.nif = 0;
        data.password = 0;

        const response = await fetch(`${urlBaseSQL}/update/user/${idUser}`, {
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
            }).then(result => {
                if (result.value) {
                    window.location.reload()
                }
            });
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

            const response = await fetch(`${urlBaseSQL}/update/password/${idUser}`, {
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
                }).then(result => {
                    if (result.value) {
                        logout();
                    }
                })
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


    //LOGOUT
    async function logout() {
        localStorage.removeItem("idUser");
        localStorage.removeItem("auth")
        window.location.replace("./../index.html");
    }

    const btnLogout = document.getElementById('logoutUser');
    btnLogout.addEventListener("click", function() {
        logout();
    });


}
