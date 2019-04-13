/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.controller;

import com.saferus.test.model.Dados;
import com.saferus.test.repository.DadosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import javax.validation.Valid;
import java.util.List;
import org.bson.types.ObjectId;

/**
 *
 * @author lucasbrito
 */
@RestController
@RequestMapping("/dados")
public class DadosController {

    @Autowired
    private DadosRepository repository;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<Dados> getAllPets() {
        return repository.findAll();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public Dados getDadosById(@PathVariable("id") ObjectId id) {
        return repository.findById(id);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public void modifyDadosById(@PathVariable("id") ObjectId id, @Valid @RequestBody Dados dados) {
        dados.setId(id);
        repository.save(dados);
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public Dados createDados(@Valid @RequestBody Dados dados) {
        dados.setId(ObjectId.get());
        repository.save(dados);
        return dados;
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteDados(@PathVariable ObjectId id) {
        repository.delete(repository.findById(id));
    }

}
