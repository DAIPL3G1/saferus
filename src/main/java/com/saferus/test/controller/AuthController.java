/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.controller;

import com.saferus.test.model.Mediador;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import com.saferus.test.model.Utilizador;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.saferus.test.service.ContaService;

@RestController
public class AuthController {

    @Autowired
    private ContaService contaService;
    
    @RequestMapping(value = {"/signup/utilizador"}, method = RequestMethod.POST)
    public void novoUtilizador(@RequestBody Utilizador user) throws Exception {
        Utilizador result = contaService.findUserByEmail(user.getEmail());
        if (result != null) {
            throw new Exception("User already exists");
        }
        contaService.saveUtilizador(user);
    }
    
    @RequestMapping(value = {"/signup/mediador"}, method = RequestMethod.POST)
    public void novoMediador(@RequestBody Mediador mediador) throws Exception {
        Mediador result = contaService.findMediadorByEmail(mediador.getEmail());
        if (result != null) {
            throw new Exception("User already exists");
        }
        contaService.saveMediador(mediador);
    }

    @RequestMapping(value = {"/access_denied"}, method = RequestMethod.GET)
    public String accessDenied() {
        return "Access Denied! Try Later!";
    }

}
