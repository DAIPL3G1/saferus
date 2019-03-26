/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.saferus.test.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.saferus.test.model.Role;
import com.saferus.test.model.User;
import com.saferus.test.repository.RoleRespository;
import com.saferus.test.repository.UserRepository;
import java.util.Arrays;
import java.util.HashSet;

@Service("userService")
public class UserServiceImpl implements UserService {
 
 @Autowired
 private UserRepository userRepository;
 
 @Autowired
 private RoleRespository roleRespository;
 
 @Autowired
 private BCryptPasswordEncoder bCryptPasswordEncoder;

 @Override
 public User findUserByEmail(String email) {
  return userRepository.findByEmail(email);
 }

 @Override
 public void saveUser(User user) {
  user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
  user.setActive(1);
  Role userRole = roleRespository.findByRole("ADMIN");
  user.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
  userRepository.save(user);
 }

}