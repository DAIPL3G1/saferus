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
        zoom: 15,
        center: new google.maps.LatLng(41.4435606, -8.336234200000002)
    });
    directionsDisplay.setMap(map);
}

async function calculateAndDisplayRoute(directionsService, directionsDisplay, idVehicle) {
    let inicio, fim;
    let waypts = [];
    const response = await fetch(`${urlBaseMongo}/api/data/24` //`${urlBaseMongo}/api/data/${idVehicle}`
        /*`${urlBaseSQL}/trip/read/datas/${idVehicle}`, {
                headers: {
                    "Authorization": auth
                }
            }*/
    );
    console.log(response);
    let positions = await response.json();
    positions = positions.data;
    console.log(positions);
    positions.sort(function(a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.DataHora) - new Date(a.DataHora);
    });

    for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        console.log(position);
        if (position.Start) {
            inicio = new google.maps.LatLng(position.Latitude, position.Longitude);
            break;
        }
        else if (position.Finish) {
            fim = new google.maps.LatLng(position.Latitude, position.Longitude);
        }
        else {
            waypts.splice(0, 0, {
                location: new google.maps.LatLng(position.Latitude, position.Longitude),
                stopover: true
            });
        }
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
            numero = veicules.length;
        }

        numeroVeiculos.innerHTML = numero;
    }
    numberVeicules();

    //numero total kms percorridos
    async function numberkmsPerc() {
        let kms = 0;
        const response = await fetch(`${urlBaseSQL}/read/user/vehicles/${idUser}`, {
            headers: {
                "Authorization": auth
            }
        })
        if (response.status == 200) {
            const veicules = await response.json();
            for (const veicule of veicules) {
                const response2 = await fetch(`${urlBaseSQL}/trip/read/${veicule.id}`, {
                    headers: {
                        'Authorization': auth
                    }
                });
                if (response2.status == 200) {
                    const trips = await response2.json();
                    for (const trip of trips) {
                        console.log(typeof trip.distance);
                        kms += (trip.distance / 1000);
                    }
                }
            }
        }
        numeroKmsPerc.innerHTML = parseFloat(Math.round(kms * 100) / 100);
    }
    numberkmsPerc();

    //numero de pontos acumulados
    async function numberPoints() {
        let numero = 0;
        /*const response = await fetch(`${urlBaseSQL}/statistics/points`, {
            headers: {
                "Authorization": auth
            }
        }); //url falta
        if (response.status == 200) {
            const points = await response.json();
            numero = points[0].numberPoints;
        }*/
        numeroPontosAc.innerHTML = numero;
    }
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
                showConfirmButton: false,
                focusConfirm: false,
                timer: 3000
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
        })
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
                for (const veicule of veicules) {
                    let vinculado = false;
                    let pendente = false;
                    console.log(veicule)
                    txt += `<tr>
                                <td>${veicule.plate}</td>
                                <td>${veicule.brand}</td>`
                    const response2 = await fetch(`${urlBaseSQL}/trip/read/${veicule.id}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    if (response2.status == 200) {
                        let kms = 0;
                        const trips = await response2.json();
                        for (const trip of trips) {
                            kms += (trip.distance / 1000);
                        }
                        txt += `<td>${parseFloat(Math.round(kms * 100) / 100)}</td>`;
                    }
                    else {
                        txt += `<td> - </td>`
                    }
                    for (const bind of binds) {
                        if (bind.vehicle.id == veicule.id) {
                            if (bind.request == 1) {
                                pendente = true;
                            }
                            if (bind.accepted == 1) {
                                vinculado = true;
                            }
                        }
                    }
                    if (vinculado) {
                        txt += `<td> <button class="btn btn-success btn-sm"><i class="fa fa-check"></i></btn></td>`;
                    }
                    else if (pendente) {
                        txt += `<td> <button class="btn btn-warning btn-sm"><i class="fa fa-clock-o"></i></button></td>`;
                    }
                    else {
                        txt += `<td> <button class="btn btn-danger btn-sm"><i class="fa fa-remove"></i></button></td>`;
                    }
                    txt += `<td> <button id="${veicule.id}" class="btn-table btn-sm estatisticas"><i class="fa fa-plus"></i></button></td>
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
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 3000
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
                            const response = await fetch(`${urlBaseMongo}/api/data/${veicule.id}` /*`${urlBaseMongo}/api/data/${veicule.id}`*/ );
                            if (response.ok) {
                                calculateAndDisplayRoute(directionsService, directionsDisplay, veicule.id);
                                let dados = await response.json();
                                dados = dados.data;
                                dados.sort(function(a, b) {
                                    // Turn your strings into dates, and then subtract them
                                    // to get a value that is either negative, positive, or zero.
                                    return new Date(a.DataHora) - new Date(b.DataHora);
                                });
                                console.log(dados);
                                let velocityAverage = 0;
                                let distance = 0;
                                let timeAboveLimit = 0;
                                let dateStart = "";
                                let dateFinish = "";
                                let dateEnd = "";
                                let hourEnd = "";
                                const R = 6371;
                                for (let i = 0; i < dados.length; i++) {
                                    if (dados[i].Start) {
                                        dateStart = new Date(dados[i].DataHora);
                                    }
                                    else if (dados[i].Finish) {
                                        dateFinish = new Date(dados[i].DataHora);
                                        dateEnd = dateFinish.getDate() + "/" + (dateFinish.getMonth() + 1) + "/" + dateFinish.getFullYear();
                                        if (dateFinish.getMinutes() < 10) {
                                            hourEnd = dateFinish.getHours() + ":0" + dateFinish.getMinutes();
                                        }
                                        else {
                                            hourEnd = dateFinish.getHours() + ":" + dateFinish.getMinutes();
                                        }
                                        velocityAverage = velocityAverage / (dados.length - 2);
                                        timeAboveLimit = timeAboveLimit / (dateFinish - dateStart);
                                    }
                                    else {
                                        let dLat = (dados[i + 1].Latitude - dados[i].Latitude) * Math.PI / 180;
                                        let dLon = (dados[i + 1].Longitude - dados[i].Longitude) * Math.PI / 180;
                                        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(dados[i].Latitude * Math.PI / 180) * Math.cos(dados[i + 1].Latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                                        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                        distance += R * c;
                                        velocityAverage += dados[i].Velocidade;
                                        if (dados[i].Velocidade > dados[i].LimiteVelocidade) {
                                            timeAboveLimit += (new Date(dados[i + 1].DataHora)) - (new Date(dados[i].DataHora));
                                        }
                                    }
                                }
                                readUltimaViagem.innerHTML = `<h5>Data (final): ${dateEnd}</h5>
                             <h5>Hora: ${hourEnd}</h5>
                             <h5>Distância: ${parseFloat(Math.round(distance * 100) / 100)} km</h5>
                             <h5>Velocidade média: ${parseFloat(Math.round(velocityAverage * 100) / 100)} km/h</h5>
                             <h5>Excesso de velocidade: ${Math.round(timeAboveLimit * 100)} % do tempo</h5>`;

                                document.getElementById("seeStatistics").style.display = "block";
                            }
                            else {
                                swal({
                                    title: 'Não existem estatísticas para apresentar. Escolha um veículo e inicie a viagem!',
                                    type: 'warning',
                                    showCloseButton: false,
                                    showConfirmButton: false,
                                    focusConfirm: false,
                                    timer: 3000
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

        if (isMatriculaValida(data.plate)) {
            const response = await fetch(`${urlBaseSQL}/add/vehicle/${idUser}`, {
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
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 1500
                }).then(() => {
                    renderVeicules();
                    renderVeiculosRegistados();
                    numberPoints();
                    numberVeicules();
                    numberkmsPerc();
                    formAddVeicules.reset();
                });
            }
            else {
                swal({
                    title: 'Não foi possível inserir o seu veículo!',
                    type: 'warning',
                    showCloseButton: false,
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 3000
                }).then(() => {
                    renderVeicules();
                    renderVeiculosRegistados();
                    numberkmsPerc();
                    numberVeicules();
                    numberPoints();
                    formAddVeicules.reset();
                });
            }
        }
        else {
            swal({
                title: 'Insira uma matricula no formato "AA-00-00","00-AA-00" ou "00-00-AA"!',
                type: 'warning',
                showCloseButton: false,
                showConfirmButton: true,
                focusConfirm: false,
                confirmButtonText: 'Sair',
                confirmButtonColor: '#B47676'
            }).then(() => {
                renderVeicules();
                renderVeiculosRegistados();
                numberkmsPerc();
                numberVeicules();
                numberPoints();
                formAddVeicules.reset();
            });
        }
    });


    //tabela dos veiculos
    const renderVeicules = async() => {

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
                        if (bind.vehicle.id == veiculeUser.id) {
                            if (bind.request == 1) {
                                pendente = true;
                            }
                            if (bind.accepted == 1) {
                                vinculado = true;
                            }
                        }
                    }
                    if (vinculado) {
                        txt += `<td> <button class="btn btn-success btn-sm">Vinculado</button></td>`;
                    }
                    else if (pendente) {
                        txt += `<td> <button class="btn btn-warning btn-sm">Pendente </button></td>`
                    }
                    else {
                        txt += `<td> <button id="${veiculeUser.plate}" class="btn-table btn-sm vincular">Vincular </button></td>`;
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
                            <td> <button id="${veiculeUser.plate}" class="btn btn-warning btn-sm vincular">Vincular</button></td>   
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
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 1500
                })
            }
            txt += `</tbody>`;
            readVeiculos.innerHTML = txt;

            //gerir botao para iniciar viagem   --  ao carregar no botao abre um swal a dizer que estao a ser recolhidos os dados e um botao de terminar 

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
                                            data.idVehicle = "100";
                                            data.speed = "0";
                                            data.start = start.toString();
                                            data.finish = finish.toString();
                                            data.dateTime = (new Date()).toString();
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
                                        console.log("2");
                                        let data = {};
                                        data.idVehicle = btnIniciar[i].getAttribute('id');
                                        data.speed = velocidadeAnterior.toString();
                                        data.start = start.toString();
                                        data.finish = finish.toString();
                                        data.dateTime = dataAtual.toString();
                                        data.latitude = latitude.toString();
                                        data.longitude = longitude.toString();
                                        data.speedLimit = velocidadeAnterior.toString();
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
                                    latitude = position.coords.latitude;
                                    longitude = position.coords.longitude;
                                    let data = {};
                                    data.idVehicle = btnIniciar[i].getAttribute('id');
                                    data.speed = "0";
                                    data.start = start.toString();
                                    data.finish = finish.toString();
                                    data.dateTime = (new Date()).toString();
                                    data.latitude = latitude.toString();
                                    data.longitude = longitude.toString();
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
                                            }
                                            else {
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
                                                showCloseButton: false,
                                                showConfirmButton: false,
                                                focusConfirm: false,
                                                timer: 3000
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
                                    else {
                                        console.log("OK");
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
                            if (veicule.plate == btnEliminar[i].getAttribute("id")) {
                                let vinculado = false;
                                let pendente = false;

                                if (binds.length != 0) {
                                    for (const bind of binds) {
                                        console.log(bind);
                                        if (bind.vehicle.id == veicule.id) {
                                            if (bind.request == 1) {
                                                pendente = true;
                                            }
                                            if (bind.accepted == 1) {
                                                vinculado = true;
                                            }
                                        }
                                    }
                                    if (vinculado) {
                                        swal({
                                            title: 'Contacte o seu mediador para desvincular o seu veículo! Obrigado!',
                                            type: 'warning',
                                            showCloseButton: false,
                                            showConfirmButton: false,
                                            focusConfirm: false,
                                            timer: 3000
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
                                                            showConfirmButton: false,
                                                            focusConfirm: false,
                                                            timer: 1500
                                                        }).then(() => {
                                                            renderVeicules();
                                                            renderVeiculosRegistados();
                                                            numberPoints();
                                                            numberVeicules();
                                                            numberkmsPerc();
                                                        });
                                                    }
                                                }
                                                catch (error) {
                                                    swal({
                                                        type: 'error',
                                                        title: 'Erro',
                                                        showCloseButton: false,
                                                        showConfirmButton: false,
                                                        focusConfirm: false,
                                                        timer: 3000,
                                                        text: error
                                                    }).then(() => {
                                                        renderVeicules();
                                                        renderVeiculosRegistados();
                                                        numberPoints();
                                                        numberVeicules();
                                                        numberkmsPerc();
                                                    });
                                                }
                                            }
                                        });
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
                                                        showConfirmButton: false,
                                                        focusConfirm: false,
                                                        timer: 1500
                                                    }).then(() => {
                                                        renderVeicules();
                                                        renderVeiculosRegistados();
                                                        numberPoints();
                                                        numberVeicules();
                                                        numberkmsPerc();

                                                    });
                                                }
                                            }
                                            catch (error) {
                                                swal({
                                                    type: 'error',
                                                    title: 'Erro',
                                                    text: error,
                                                    showCloseButton: false,
                                                    showConfirmButton: false,
                                                    focusConfirm: false,
                                                    timer: 1500
                                                }).then(() => {
                                                    renderVeicules();
                                                    renderVeiculosRegistados();
                                                    numberPoints();
                                                    numberVeicules();
                                                    numberkmsPerc();
                                                });
                                            }
                                        }
                                    });
                                }
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
                                    title: 'Vincular Veículo',
                                    html: `<div><table class="table table-striped table-advance table-hover centered">
                                             <thead>
                                              <tr>
                                                <th class="centered"><i class="fa fa-user"></i> Nome</th>
                                                <th class="centered"><i class="fa fa-home"></i> Código Postal</th>
                                                <th class="centered"><i class="fa fa-phone"></i> Contacto</th>
                                              </tr>
                                            </thead>
                                            <tbody>${txt1}
                                            </tbody>
                                            </table>
                                            </div>
                                         <div>
                                        <form>
                                            <select name="selectType" id="selectMediador" class="swal2-input" required>
                                                <option value="" selected disabled hidden>Selecione um mediador</option>
                                                ${txt}
                                            </select></form></div>`,
                                    width: '800px',
                                    showCancelButton: false,
                                    confirmButtonText: "Vincular",
                                    confirmButtonColor: '#B47676',
                                    showLoaderOnConfirm: true,
                                    preConfirm: () => {
                                        const selectMediador = document.getElementById("selectMediador");
                                        const mediador = selectMediador.options[selectMediador.selectedIndex].getAttribute("id");
                                        let data = {};
                                        data.plate = veiculeUser.plate;
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
                                                title: 'Pedido de vinculação efetuado com sucesso!',
                                                type: 'success',
                                                showCloseButton: false,
                                                showConfirmButton: false,
                                                focusConfirm: false,
                                                timer: 1500
                                            }).then(() => {
                                                renderVeicules();
                                                renderVeiculosRegistados();
                                                numberPoints();
                                                numberVeicules();
                                                numberkmsPerc();
                                            });
                                        }
                                        else {
                                            swal({
                                                title: `Ocorreu um erro ao tentar vincular o veículo. Tente mais tarde!`,
                                                showCloseButton: false,
                                                showConfirmButton: false,
                                                focusConfirm: false,
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
                showConfirmButton: false,
                focusConfirm: false,
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
                showConfirmButton: false,
                focusConfirm: false,
                timer: 3000
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
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 1500
                }).then(logout());
            }
            else {
                swal({
                    title: 'Ocorreu um erro! Tente novamente!',
                    type: 'warning',
                    showCloseButton: false,
                    showConfirmButton: false,
                    focusConfirm: false,
                    timer: 3000
                })
            }
        }
        else {
            swal({
                title: 'As passwords não correspondem!',
                type: 'warning',
                showCloseButton: false,
                showConfirmButton: false,
                focusConfirm: false,
                timer: 3000
            })
        }
    });

    //LOGOUT
    function logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("auth");
        window.location.replace("./../index.html");
    }

    const btnLogout = document.getElementById('logoutUser');
    btnLogout.addEventListener("click", function() {
        logout();
    });


    //verificar Matricula
    function isMatriculaValida(matricula) {
        //valida o tamanho e posiçao do carater "-"~
        if (matricula.length !== 8 || matricula.charAt(2) != "-" || matricula.charAt(5) != "-") {
            return false;
        }
        const m = [matricula.slice(0, 2), matricula.slice(3, 5), matricula.slice(6, 8)];

        let numeros = 0,
            letras = 0;

        for (let i = 0; i < m.length; i++) {
            if (isNumber(m[i])) {
                numeros += 1;
            }
            if (isLetter(m[i])) {
                letras += 1;
            }
        }
        //verifica se a matricula contem os 4 numeros e 2 letras maiusculas
        if (numeros == 2 && letras == 1) {
            return true;
        }
        return false;
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function isLetter(str) {
        let x = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) === str.charAt(i).toUpperCase() && str.charAt(i).match(/[a-z]/gi)) {
                x += 1;
            }
        }
        if (x == str.length) {
            return true;
        }
        else return false;
    }
}
