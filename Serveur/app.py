from flask import Flask, request, jsonify
from flask.wrappers import Request
import pymysql.cursors
app = Flask(__name__)

def get_db_connection(type):
    connection = pymysql.connect(
        host='www-ens.iro.umontreal.ca',
        user='lamysamu',
        password='password123',
        db='lamysamu_jeu2048',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor)
    conn = connection.cursor()

    if (type == "delete" or type == "edit" or type == "create"):
        conn = connection

    return conn

sql_select_all = "SELECT * FROM comptes"
sql_insert = "INSERT INTO comptes (login, mot_de_passe, administrateur) VALUES (%s, %s, %s)"
sql_update_score = "UPDATE comptes SET score_max = %s WHERE id = %s"
sql_update_online = "UPDATE comptes SET online = %s WHERE id = %s"

#Je n'utilise pas le home dans mon programme c'est juste si pour voir la base de donné sur le navigateur
#Je sais que ce n'est pas sécuritaire mais je le laisse pour que vous puissiez voir la base de donnée dans la correction
@app.route("/")
def home():
    conn = get_db_connection("selectall")
    conn.execute(sql_select_all)
    comptes = conn.fetchall()
    conn.close()
    return jsonify(comptes)

#Permet d'inscrire un utilisateur
@app.route("/creation", methods=['POST'])
def add_membre():
    login = request.form['logincr']
    mdp = request.form['mdpcr']
    admin = request.form['admincr'] 
    conn = get_db_connection("selectall")
    conn.execute(sql_select_all)
    comptes = conn.fetchall()
    conn.close()
    for compte in comptes:
        if(compte['login'] == login):
            return jsonify(False)
    conn = get_db_connection("create")
    if(admin == "true"):
        conn.cursor().execute(sql_insert, (login, mdp, 1))
    else:
        conn.cursor().execute(sql_insert, (login, mdp, 0))
    conn.commit()
    conn.close()
    return jsonify(True)

#Permet de login un utilisateur
@app.route("/login", methods=['POST'])
def login():
    login = request.form['loginco']
    mdp = request.form['mdpco']
    conn = get_db_connection("selectall")
    conn.execute(sql_select_all)
    comptes = conn.fetchall()
    conn.close()
    for compte in comptes:
        if(compte['login'] == login and compte['mot_de_passe'] == mdp):
            return jsonify({'id' : compte['id'], 'nomcompte' : compte['login'], 'scoreMax' : compte['score_max'], 'admin' : compte['administrateur']})
    return jsonify(False)

#Donne les infos du panneau admin
@app.route("/admin")
def admin():
    conn = get_db_connection("selectall")
    conn.execute(sql_select_all)
    comptes = conn.fetchall()
    conn.close()
    arrComptes = []
    for compte in comptes:
            arrComptes.append({'id' : compte['id'], 'nomcompte' : compte['login'], 'scoreMax' : compte['score_max'], 'admin' : compte['administrateur'], 'dateInscription' : compte['date_inscription'], 'online' : compte['online']})
    return jsonify(arrComptes)

#Enregistre un nouveau score
@app.route("/score", methods=['POST'])
def new_score():
    dataRecu = request.json
    id = dataRecu['id']
    score = dataRecu['score']
    conn = get_db_connection("edit")
    conn.cursor().execute(sql_update_score, (score, id))
    conn.commit()
    conn.close()
    return jsonify(score)

#Met une personne en ligne dans la base de donnée
@app.route("/setonline", methods=['POST'])
def setonline():
    dataRecu = request.json
    id = dataRecu['id']
    conn = get_db_connection("edit")
    conn.cursor().execute(sql_update_online, (1, id))
    conn.commit()
    conn.close()
    return jsonify(1)

#Met une personne hors ligne dans la base de donnée
@app.route("/setoffline", methods=['POST'])
def setoffline():
    dataRecu = request.json
    id = dataRecu['id']
    conn = get_db_connection("edit")
    conn.cursor().execute(sql_update_online, (0, id))
    conn.commit()
    conn.close()
    return jsonify(0)