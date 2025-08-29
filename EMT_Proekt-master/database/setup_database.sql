-- Креирај база на податоци
CREATE DATABASE assignments_db;

-- Создај корисник
CREATE USER assignments_user WITH PASSWORD 'password123';

-- Дај привилегии на корисникот
GRANT ALL PRIVILEGES ON DATABASE assignments_db TO assignments_user;
GRANT ALL ON SCHEMA public TO assignments_user;

-- Конектирај се на новата база
\c assignments_db;

-- Дај привилегии на табелите и секвенците (ова ќе работи откако ќе се создадат табелите)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO assignments_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO assignments_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO assignments_user;