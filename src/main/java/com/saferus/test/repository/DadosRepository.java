/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.repository;

import com.saferus.test.model.Dados;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DadosRepository extends MongoRepository<Dados, String> {

    public Dados findById(ObjectId id);

}
