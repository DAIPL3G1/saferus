/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.saferus.test.model.User;

@Repository("userRepository")
public interface UserRepository extends JpaRepository<User, Long> {
 
 User findByEmail(String email);
}
