/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.service;

import com.saferus.test.model.Conta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.saferus.test.model.Mediador;
import com.saferus.test.model.Role;
import com.saferus.test.model.Utilizador;
import com.saferus.test.repository.ContaRepository;
import com.saferus.test.repository.RoleRepository;
import java.util.Arrays;
import java.util.HashSet;

@Service("ContaService")
public class ContaServiceImpl implements ContaService {

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private RoleRepository roleRespository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public Mediador findMediadorByEmail(String email) {
        return contaRepository.findMediadorByEmail(email);
    }

    @Override
    public void saveMediador(Mediador mediador) {
        mediador.setPassword(bCryptPasswordEncoder.encode(mediador.getPassword()));
        mediador.setAtivo(1);
        contaRepository.save(mediador);
    }

    @Override
    public Utilizador findUserByEmail(String email) {
        return contaRepository.findUserByEmail(email);
    }

    @Override
    public void saveUtilizador(Utilizador utilizador) {
        utilizador.setPassword(bCryptPasswordEncoder.encode(utilizador.getPassword()));
        utilizador.setAtivo(1);
        Role userRole = roleRespository.findByRole("GENERICO");
        utilizador.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
        contaRepository.save(utilizador);
    }
}
