create database mealie
character set utf8mb4
collate utf8mb4_unicode_ci;


create table users (
	user_id int auto_increment primary key,
    username varchar(100) not null,
    email varchar(150) not null unique,
    password_hash varchar(255) not null
);

create table meals (
	meal_id int auto_increment primary key,
	user_id int not null,
    title varchar(150) not null,
    meal_day varchar(50),
    time_of_day varchar(50),
    foreign key (user_id) references users(user_id)
);    

show databases;

use mealie;

show tables;

select * from users;

select * from meals;

