#!/bin/bash

PSQL="psql --username=freecodecamp --dbname=periodic_table -t --no-align -c"

# Verificar si se proporcionó un argumento
if [[ -z $1 ]]; then
  echo "Please provide an element as an argument."
  exit
fi

# Buscar el elemento por número, símbolo o nombre
if [[ $1 =~ ^[0-9]+$ ]]; then
  ELEMENT=$($PSQL "SELECT atomic_number, name, symbol, atomic_mass, melting_point_celsius, boiling_point_celsius, type FROM elements 
  JOIN properties USING(atomic_number)
  JOIN types USING(type_id)
  WHERE atomic_number = $1;")
else
  ELEMENT=$($PSQL "SELECT atomic_number, name, symbol, atomic_mass, melting_point_celsius, boiling_point_celsius, type FROM elements 
  JOIN properties USING(atomic_number)
  JOIN types USING(type_id)
  WHERE symbol = INITCAP('$1') OR name = INITCAP('$1');")
fi

