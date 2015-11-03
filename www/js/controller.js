/* global angular, document, window */
'use strict';

angular.module('starter.controllers', [])

        .controller('AppCtrl', function ($scope, $state,$timeout) {
                // Form data for the login modal
                $scope.loginData = {};
                $scope.idUSER = "";
                $scope.imgUser = "";
                $scope.nomeUser = "";
                $scope.cidadeUser = "";
                $scope.estadoUser = "";
                $scope.bairroUser = "";
                $scope.tipoLogin = "";
                $scope.isExpanded = false;
                $scope.hasHeaderFabLeft = false;
                $scope.lista = [];
                $scope.hasHeaderFabRight = false;

        })

        .controller('LoginCtrl', function ($scope,$log, $timeout, $http, $state, $stateParams) {
                var self = this;
                $scope.loginData = {};
                $scope.msg = "";

                var username, senha;

                $scope.doLogin = function () {
                        username = $scope.loginData.user;
                        senha = $scope.loginData.senha;
                        $scope.loading();
                        if (username == "" || username == undefined || username == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo nome está vazio.";
                                $scope.showPopup();
                        } else if (senha == "" || senha == undefined || senha == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo senha está vazio.";
                                $scope.showPopup();
                        } else {
                                $http.post("http://servidorteste.tvnoar.tv/quebra/public_html/login", {"username": username, "senha": senha})
                                        .success(function (response) {
                                                //fazer verificacao do usuario se existiu ou nao no bd e deixa variavel global definida
                                                if (response.status == 0) {
                                                        $state.go("app.feed");
                                                } else if (response.status == 1) {
                                                        $scope.msg = "Não existe usuário com esse email.";
                                                } else if (response.status == 2) {

                                                        $scope.msg = "Houve um erro ao se comunicar com o servidor.";

                                                } else if (response.status == 3) {

                                                        $scope.msg = "Senha esta incorreta.";

                                                }
                                        });
                        }
                };
        })

        .controller('ProfileCtrl', function ($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
                // Set Header
                $scope.$parent.auth();//autentica o usuario

                // Set Motion
                $timeout(function () {
                        ionicMaterialMotion.slideUp({
                                selector: '.slide-up'
                        });
                }, 300);

                $timeout(function () {
                        ionicMaterialMotion.fadeSlideInRight({
                                startVelocity: 3000
                        });
                }, 700);

                $scope.nome = $scope.$parent.nomeUser;
                $scope.img = $scope.$parent.imgUser;
                console.log($scope.nome);



                // Set Ink
                ionicMaterialInk.displayEffect();
        })

        .controller('FeedCtrl', function ($scope, $stateParams, $ionicLoading, $ionicPopup, $ionicActionSheet, $http, $timeout, $filter, ionicMaterialMotion, ionicMaterialInk) {
                $scope.$parent.showHeader();
                $scope.$parent.clearFabs();
                $scope.hideBackButton = true;
                $scope.isExpanded = false;
                $scope.$parent.setExpanded(false);//tira o botao back eu acho
                $scope.$parent.setHeaderFab(false);
                $scope.lista = [];
                $scope.dados = [];
                var myFilter = $filter;

                $scope.$parent.auth();//autentica o usuario

                $scope.showPopup = function () {
                        var alertPopup = $ionicPopup.alert({
                                title: 'Alerta',
                                template: $scope.msg
                        });
                        $timeout(function () {
                                ionicMaterialInk.displayEffect();
                        }, 0);
                };

                $scope.loading = function () {
                        $ionicLoading.show({
                                template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
                        });
                };


                $scope.atualizarJson = function (params) {

                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/listaUsers", {params: params})
                                .success(function (response) {
                                        angular.forEach(response, function (child) {
                                                $scope.lista.push(child);
                                                $scope.$parent.lista.push(child);
                                        });
                                });
                };

                $scope.jsonUsers = function (params) {

                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/listaUsers", {params: params})
                                .success(function (response) {
                                        angular.forEach(response, function (child) {
                                                $scope.lista.push(child);
                                                $scope.$parent.lista.push(child);
                                        });
                                        console.log($scope.lista);
                                        $timeout(function () {
                                                ionicMaterialMotion.fadeSlideIn({
                                                        selector: '.animate-fade-slide-in .item'
                                                });
                                        }, 100);
                                });
                };

                $scope.saveRecom = function (id, recomend) {
                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/saveRecomendacao/" + id, {"tstes": "teste"})
                                .success(function (response) {
                                        if (response.status == 0) {
                                                $ionicLoading.hide();
                                                $scope.msg = "Recomendado com sucesso.";
                                                $scope.showPopup();
                                                $scope.lista = [];
                                                $scope.$parent.lista = [];
                                                $scope.atualizarJson();
                                                var myEl = angular.element(document.querySelector('#recomend'));
                                                myEl.text(recomend + 1);
                                        } else {
                                                $ionicLoading.hide();
                                                $scope.msg = "Este usuario nao existe no sistema.";
                                                $scope.showPopup();
                                        }
                                });
                };

                $scope.id = $stateParams.feedId;
                if ($scope.id > 0) {

                        $scope.actionSheet = function () {

                                // Show the action sheet
                                var hideSheet = $ionicActionSheet.show({
                                        buttons: [{
                                                        text: 'Recomendar'
                                                }],
                                        titleText: 'Recomendar este quebra galho?',
                                        cancelText: 'Cancelar',
                                        cancel: function () {
                                                // add cancel code..
                                        },
                                        buttonClicked: function (index) {
                                                if (index == 0) {
                                                        $scope.loading();
                                                        $scope.saveRecom($scope.id, $scope.dados[0].recomendacoes);
                                                }
                                                return true;
                                        }
                                });
                        };

                        $scope.dados = [];
                        $scope.dados = myFilter('filter')($scope.$parent.lista, {
                                id: $scope.id
                        });
                        // Set Motion
                        $timeout(function () {
                                ionicMaterialMotion.slideUp({
                                        selector: '.slide-up'
                                });
                        }, 300);

                        $timeout(function () {
                                ionicMaterialMotion.fadeSlideInRight({
                                        startVelocity: 3000
                                });
                        }, 700);

                        console.log($scope.dados);
                } else {
                        if ($scope.$parent.lista.length == 0) {
                                $scope.jsonUsers();
                                console.log("carrega json" + $scope.$parent.lista.length);
                        } else {
                                $scope.lista = $scope.$parent.lista;
                                $timeout(function () {
                                        ionicMaterialMotion.fadeSlideIn({
                                                selector: '.animate-fade-slide-in .item'
                                        });
                                }, 100);
                        }
                }

                // Activate ink for controller
                ionicMaterialInk.displayEffect();
        })

        .controller('CadastroCtrl', function ($scope, $timeout, $ionicPopup, $ionicLoading, $http, $state, $ionicSideMenuDelegate, ionicMaterialMotion, ionicMaterialInk) {
                $scope.$parent.clearFabs();
                $scope.isExpanded = true;
                $scope.$parent.setExpanded(false);
                $ionicSideMenuDelegate.canDragContent(false);
                $scope.cadData = {};
                $scope.estados = [];
                $scope.cidades = [];
                $scope.bairros = [];

                // Confirm
                $scope.showPopup = function () {
                        var alertPopup = $ionicPopup.alert({
                                title: 'Alerta',
                                template: $scope.msg
                        });

                        $timeout(function () {
                                ionicMaterialInk.displayEffect();
                        }, 0);
                };

                $scope.loading = function () {
                        $ionicLoading.show({
                                template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
                        });
                };

                $scope.estadoFunc = function () {
                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/estados", {'params': 'params'})
                                .success(function (response) {
                                        angular.forEach(response, function (child) {
                                                $scope.estados.push(child);
                                        });
                                });
                };

                $scope.cidadeFunc = function (item) {
                        $scope.cadData.estado = item.id;
                        $scope.cidades = [];
                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/cidades/" + item.id, {'params': 'params'})
                                .success(function (response) {
                                        angular.forEach(response, function (child) {
                                                $scope.cidades.push(child);
                                        });
                                });
                };

                $scope.bairroFunc = function (item) {
                        $scope.cadData.cidade = item.id;
                        $scope.bairros = [];
                        $http.get("http://servidorteste.tvnoar.tv/quebra/public_html/bairros/" + item.id, {'params': 'params'})
                                .success(function (response) {
                                        angular.forEach(response, function (child) {
                                                $scope.bairros.push(child);
                                        });
                                });
                };

                $scope.selectBairro = function (item) {
                        $scope.cadData.bairro = item.id;
                };

                var nome, email, telefone, senha, cpf, estado, cidade, bairro;

                $scope.doCadastro = function () {
                        nome = $scope.cadData.nome;
                        senha = $scope.cadData.senha;
                        email = $scope.cadData.email;
                        telefone = $scope.cadData.telefone;
                        cpf = $scope.cadData.cpf;
                        estado = $scope.cadData.estado;
                        cidade = $scope.cadData.cidade;
                        bairro = $scope.cadData.bairro;
                        $scope.loading();
                        if (nome == "" || nome == undefined || nome == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo nome está vazio.";
                                $scope.showPopup();
                        } else if (email == "" || email == undefined || email == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo email está vazio.";
                                $scope.showPopup();
                        } else if (telefone == "" || telefone == undefined || telefone == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo telefone está vazio.";
                                $scope.showPopup();
                        } else if (cpf == "" || cpf == undefined || cpf == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo cpf está vazio.";
                                $scope.showPopup();
                        } else if (senha == "" || senha == undefined || senha == null) {
                                $ionicLoading.hide();
                                $scope.msg = "Campo senha está vazio.";
                                $scope.showPopup();
                        } else {
                                $http.post("http://servidorteste.tvnoar.tv/quebra/public_html/cadastrarUser", {"nome": nome, "email": email, "telefone": telefone, "cpf": cpf, "senha": senha, "estado": estado, "cidade": cidade, "bairro": bairro})
                                        .success(function (response) {
                                                //fazer verificacao do usuario se existiu ou nao no bd e deixa variavel global definida
                                                if (response.status == 0) {
                                                        $ionicLoading.hide();
                                                        $scope.msg = "Cadastro feito com sucesso.";
                                                        $scope.showPopup();
                                                        $state.go("app.login");
                                                } else {
                                                        $ionicLoading.hide();
                                                        $scope.msg = "Senha esta incorreta.";
                                                        $scope.showPopup();
                                                }
                                        });
                        }
                };

                $scope.$parent.auth();//autentica o usuario


                $scope.estadoFunc();

                //animacao de entrada
                ionicMaterialMotion.fadeSlideIn();
                // Set Ink
                ionicMaterialInk.displayEffect();
        })

        .controller('editPerfilCtrl', function($scope, $timeout, $ionicPopup, $http, $ionicLoading, $stateParams, ionicMaterialInk, ionicMaterialMotion){
                $scope.$parent.clearFabs();
                $scope.isExpanded = true;
                $scope.$parent.setExpanded(false);


                $scope.$parent.auth();//autentica o usuario
                //animacao de entrada
                ionicMaterialMotion.fadeSlideIn();
                // Set Ink
                ionicMaterialInk.displayEffect();
        })

        .controller('FriendsCtrl', function ($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
                // Set Header
                $scope.$parent.showHeader();
                $scope.$parent.clearFabs();
                $scope.$parent.setHeaderFab('left');

                $scope.$parent.auth();//autentica o usuario

                // Delay expansion
                $timeout(function () {
                        /*$scope.isExpanded = true;
                         $scope.$parent.setExpanded(true);*/
                        $scope.isExpanded = false;
                        $scope.$parent.setExpanded(false);
                }, 300);

                // Set Motion
                ionicMaterialMotion.fadeSlideInRight();

                // Set Ink
                ionicMaterialInk.displayEffect();
        })

        .controller('GalleryCtrl', function ($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
                $scope.$parent.showHeader();
                $scope.$parent.clearFabs();
                /*$scope.isExpanded = true;
                 $scope.$parent.setExpanded(true);*/
                $scope.isExpanded = false;
                $scope.$parent.setExpanded(false);
                $scope.$parent.setHeaderFab(false);

                $scope.$parent.auth();//autentica o usuario

                // Activate ink for controller
                ionicMaterialInk.displayEffect();

                ionicMaterialMotion.pushDown({
                        selector: '.push-down'
                });
                ionicMaterialMotion.fadeSlideInRight({
                        selector: '.animate-fade-slide-in .item'
                });

        })

        ;
