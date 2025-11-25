''' Convierte el archivo binario "bolsa.pkl" a "words.js" 
    generando una constande en JS de las palabras para uso en la versión web.

    Creado por George Aghazarian - aghazarian@pm.me
    Última versión: 21 de noviembre de 2025 - 15:20

    Este programa es un accesorio complementario.

    Archivos imprescindibles con al menos un jugador registrado (no se permitirán nuevos registros):
        main.py
        {player}.pkl

    Archivos imprescindibles en la carpeta si no hay jugadores registrados:
        main.py
        bolsa.pkl
        
    Archivos totales:
        main.py         		- programa principal
        generador.py    		- genera la base de palabras bolsa.pkl a partir de un archivo a elegir que contenga las palabras
        agregador.py    		- gestor del archivo bolsa.pkl que permite agregar, eliminar, contabilizar y listar las palabras
        sugerencias.py			- receptor de sugerencias de palabras
        conversor.py    		- convierte bolsa.pkl a bolsa_set.py cuyo contenido es bolsa = {aquí dentro un set con las palabras}
        list2bin.py				- proceso iverso a conversor.py
        wordsJS_to_pyPKL.py		- igual a list2bin.py pero a partir de words.js
        bolsaPKL_to_wordsJS.py	- proceso inverso a wordsJS_to_pyPKL.py
        bolsa.pkl       		- archivo que contiene la fuente de palabras original para crear un jugador
        frecuentes.txt  		- base de las palabras más frecuentes del castellano
        es.dic          		- corrector ortográfico de LibreOfiice para usar de base de miles de plabras
        icono.png       		- icono de WORDLE

    Requiere python3

'''

from os import system, path
if system("clear") != 0: system("cls")  # Limpiar pantalla
import subprocess
import pickle
import sys

if path.exists('bolsa.pkl'):
    # Recuperación del archivo bolsa de palabras
    with open('bolsa.pkl', 'rb') as archivo:
        bolsa = pickle.load(archivo)
else:
    print('No está presente el archivo <bolsa.pkl>')
    sys.exit()

bolsa = str(bolsa)
bolsa = bolsa.strip("{}")
bolsa = 'const WORDS = [' + str(bolsa) + "];"

destino = open('words.js', 'w')
destino.write(bolsa)
destino.close()
