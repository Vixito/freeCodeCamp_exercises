#!/bin/bash

PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

# pedir username
echo "Enter your username:"
read USERNAME
