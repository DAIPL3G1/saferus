/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.service;

import com.saferus.test.model.Mediador;
import com.saferus.test.model.Utilizador;

/**
 *
 * @author lucasbrito
 */
public interface ContaService {
  
 public Mediador findMediadorByEmail(String email);
 public Utilizador findUserByEmail(String email);
 
 public void saveMediador(Mediador mediador);
 public void saveUtilizador(Utilizador utilizador);
}