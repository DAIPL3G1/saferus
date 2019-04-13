/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.model;


/**
 *
 * @author lucasbrito
 */

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

public class Dados {
    
  @Id  
  public ObjectId id;
  
  public String name;
  public int valor;
  
  // Constructors
  public Dados() {}
  
  public Dados(ObjectId id, String name, int valor) {
    this.id = id;
    this.name = name;
    this.valor = valor;
  }
  
  // ObjectId needs to be converted to string

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public int getValor() {
        return valor;
    }

    public void setValor(int valor) {
        this.valor = valor;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
