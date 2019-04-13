/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.repository;

import com.saferus.test.model.Conta;
import com.saferus.test.model.Mediador;
import com.saferus.test.model.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author lucasbrito
 */
@Repository("contaRepository")
public interface ContaRepository extends JpaRepository<Conta, Long> {
    
    Mediador findMediadorByEmail(String email);
    Utilizador findUserByEmail(String email);
    
}
