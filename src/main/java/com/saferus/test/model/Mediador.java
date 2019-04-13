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
import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "Mediador")
public class Mediador extends Conta implements Serializable {

    @Column(name = "nome")
    private String nome;
    
    @Column(name = "apelido")
    private String apelido;

    @Column(name = "telefone")
    private int telefone;
    
    public String getApelido() {
        return apelido;
    }

    public void setApelido(String apelido) {
        this.apelido = apelido;
    }

    public int getTelefone() {
        return telefone;
    }

    public void setTelefone(int telefone) {
        this.telefone = telefone;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public void setPassword(String password) {
        this.password = password;
    }

    public int getIdMediador() {
        return idConta;
    }

    public void setIdMediador(int id) {
        this.idConta = id;
    }

    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome){
        this.nome = nome;
    }
    
    @Override
    public int getAtivo() {
        return ativo;
    }

    @Override
    public void setAtivo(int active) {
        this.ativo = active;
    }
}
