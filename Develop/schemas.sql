DROP DATABASE IF EXISTS business_db;
CREATE database business_db;

USE business_db;

CREATE TABLE employee (
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT AUTO_INCREMENT NOT NULL,
  PRIMARY KEY (ROLE_ID)
);


CREATE TABLE role (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(30) NOT NULL,
  salary INT NOT NULL,
  departmnet_id INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE department(
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

