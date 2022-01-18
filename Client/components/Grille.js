let urlJSON = "https://www-ens.iro.umontreal.ca/~lamysamu/cgi-bin/init.cgi/"
let affichageFinal = <div></div>
class Grille extends React.Component {
    constructor(props) {
        super(props)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.creeCompte = this.creeCompte.bind(this)
        this.btnLogin = this.btnLogin.bind(this)
        this.loginCompte = this.loginCompte.bind(this)
        this.setJeu = this.setJeu.bind(this)
        this.logout = this.logout.bind(this)
        this.boutonAdmin = this.boutonAdmin.bind(this)
        const corps = document.getElementById("corps")
        corps.addEventListener("keydown", (e) => { this.handleKeyDown(e) })
        this.state = {
            nbDeplacements: 0,
            valCases: Array(this.props.n).fill(0).map(() => new Array(this.props.n).fill(0)),
            caseFus: Array(this.props.n).fill(false).map(() => new Array(this.props.n).fill(false)),
            //0=login, 1=jeu, 2=module admin
            page: 0,
            idCompte: -1,
            nomcompte: '',
            scoreMax: null,
            scoreMaxTotal: null,
            admin: false
        }
        //C'est plus simple d'initialiser le jeu avec que des case vide et d'ajouter les 2 cases après
        //que d'initialiser le tableau directement avec les 2 cases random
        this.newTile(2)
        this.newTile(2)
    }

    //Ajoute une tile avec la valeur sécifié aléatoirement sur le jeu
    newTile(valeur) {
        const copieTab = this.state.valCases.slice()
        let randX = Math.floor(Math.random() * this.props.n)
        let randY = Math.floor(Math.random() * this.props.n)
        //Génère des positions random de nouvelle tile jusqu'à ce qu'une soit valide
        while (copieTab[randX][randY] != 0) {
            randX = Math.floor(Math.random() * this.props.n)
            randY = Math.floor(Math.random() * this.props.n)
        }
        copieTab[randX][randY] = valeur
        this.setState({ valCases: copieTab })
    }

    //Vérifie si une case pourrai ce déplacer dans une case adjacente dans une direction spécifiée 
    checkCaseAdj(posX, posY, dirX, dirY) {
        const copieTab = this.state.valCases.slice()
        if ((posX + dirX) < this.props.n && (posY + dirY) < this.props.n && (posX + dirX) >= 0 && (posY + dirY) >= 0) {
            if ((copieTab[posY + dirY][posX + dirX] == 0 || copieTab[posY + dirY][posX + dirX] == copieTab[posY][posX]) && copieTab[posY][posX] != 0 && !this.state.caseFus[posY][posX]) {
                return true
            }
        }
        return false
    }

    //Déplace une case dans une autre case
    deplaceCase(depX, depY, arrivX, arrivY) {
        const copieTab = this.state.valCases.slice()
        if (copieTab[arrivY][arrivX] == 0) {
            copieTab[arrivY][arrivX] = copieTab[depY][depX]
            copieTab[depY][depX] = 0
            this.setState({ valCases: copieTab })
            return
        }
        copieTab[arrivY][arrivX] = copieTab[depY][depX] * 2
        copieTab[depY][depX] = 0
        this.setState({ valCases: copieTab })
        //Si une case est fusionné on le prend en note dans le state
        const copieTabFus = this.state.caseFus.slice()
        copieTabFus[arrivY][arrivX] = true
        this.setState({ casesFus: copieTabFus })
    }

    //Effectue les actions de fin de tour
    finTour() {
        this.setState({ nbDeplacements: this.state.nbDeplacements + 1 })
        this.setState({ caseFus: Array(this.props.n).fill(false).map(() => new Array(this.props.n).fill(false)) })
        if (!this.checkPerdu() && !this.checkGagne()) {
            let rand = Math.floor(Math.random() * 2)
            this.newTile(2 + (2 * rand))
        }
    }

    //Vérifie si l'array 2D qui contient les valeurs du jeu contient une case vide
    containsZero() {
        for (let i = 0; i < this.state.valCases.length; i++) {
            for (let j = 0; j < this.state.valCases.length; j++) {
                if (this.state.valCases[i][j] == 0) {
                    return true
                }
            }
        }
        return false
    }

    //Vérifie si le joueur a perdu
    checkPerdu() {
        if (!this.containsZero() && !this.checkMovePossible(-1, 0) && !this.checkMovePossible(1, 0) && !this.checkMovePossible(0, 1) && !this.checkMovePossible(0, -1)) {
            return true
        }
        return false
    }

    //Vérifie si le joueur a gagné
    checkGagne() {
        for (let i = 0; i < this.state.valCases.length; i++) {
            for (let j = 0; j < this.state.valCases.length; j++) {
                if (this.state.valCases[i][j] == 2048) {
                    this.setNewScore()
                    return true
                }
            }
        }
        return false
    }

    //Vérifie si un mouvement dans une direction spécifiée est possible
    checkMovePossible(dirX, dirY) {
        for (let i = 0; i < this.state.valCases.length; i++) {
            for (let j = 0; j < this.state.valCases.length; j++) {
                if (this.checkCaseAdj(i, j, dirX, dirY)) {
                    return true
                }
            }
        }
        return false
    }

    //Déplace les tiles vers le bas de une case
    bas() {
        let nbMoves = 0
        for (let i = this.props.n - 1; i >= 0; i--) {
            for (let j = 0; j < this.props.n; j++) {
                if (this.checkCaseAdj(j, i, 0, 1)) {
                    this.deplaceCase(j, i, j, i + 1)
                    nbMoves++
                }
            }
        }
        if (nbMoves == 0) {
            return false
        }
        return true
    }

    //Déplace les tiles vers le haut de une case
    haut() {
        let nbMoves = 0
        for (let i = 0; i < this.props.n; i++) {
            for (let j = 0; j < this.props.n; j++) {
                if (this.checkCaseAdj(j, i, 0, -1)) {
                    this.deplaceCase(j, i, j, i - 1)
                    nbMoves++
                }
            }
        }
        if (nbMoves == 0) {
            return false
        }
        return true
    }

    //Déplace les tiles vers la gauche de une case
    gauche() {
        let nbMoves = 0
        for (let i = 0; i < this.props.n; i++) {
            for (let j = 0; j < this.props.n; j++) {
                if (this.checkCaseAdj(i, j, -1, 0)) {
                    this.deplaceCase(i, j, i - 1, j)
                    nbMoves++
                }
            }
        }
        if (nbMoves == 0) {
            return false
        }
        return true
    }

    //Déplace les tiles vers la droite de une case
    droite() {
        let nbMoves = 0
        for (let i = this.props.n - 1; i >= 0; i--) {
            for (let j = 0; j < this.props.n; j++) {
                if (this.checkCaseAdj(i, j, 1, 0)) {
                    this.deplaceCase(i, j, i + 1, j)
                    nbMoves++
                }
            }
        }
        if (nbMoves == 0) {
            return false
        }
        return true
    }

    //Si un bouton du clavier est appuyer effectue l'action correspondante
    handleKeyDown(e) {
        if (e.keyCode === 82) {
            this.reset()
            return
        }
        if (!this.checkPerdu() && !this.checkGagne()) {
            //Les loop dans les if n'exécute pas de code autre que leurs conditions
            if (e.keyCode === 37 && this.checkMovePossible(-1, 0)) {
                while (this.gauche()) { }
            }
            else if (e.keyCode === 38 && this.checkMovePossible(0, -1)) {
                while (this.haut()) { }
            }
            else if (e.keyCode === 39 && this.checkMovePossible(1, 0)) {
                while (this.droite()) { }
            }
            else if (e.keyCode === 40 && this.checkMovePossible(0, 1)) {
                while (this.bas()) { }
            }
            //On fait un return ici parce que le move n'est pas valide donc on ne fait pas finTour()
            else {
                return
            }
            this.finTour()
        }
    }

    //Reset le jeu
    reset() {
        this.setState({
            nbDeplacements: 0,
            valCases: Array(this.props.n).fill(0).map(() => new Array(this.props.n).fill(0)),
            caseFus: Array(this.props.n).fill(false).map(() => new Array(this.props.n).fill(false))
        })
        this.newTile(2)
        this.newTile(2)
    }

    //Met l'affichage du login
    login() {
        return <div>
            <div class="container position-absolute top-50 start-50 translate-middle">
                <div class="row g-8">
                    <form id="form-conn" class="col border">
                        <h3>Se connecter:</h3>
                        <input type="text" class="form-control" id="loginco" placeholder="login" />
                        <br />
                        <input type="password" class="form-control" id="mdpco" placeholder="password" />
                        <br />
                        <button type="button" class="btn btn-primary" onClick={this.btnLogin}>Login</button>
                    </form>

                    <form id="form-creation" class="col border">
                        <h3>Créer un compte:</h3>
                        <input type="text" class="form-control" id="logincr" placeholder="login" />
                        <br />
                        <input type="password" class="form-control" id="mdpcr" placeholder="password" />
                        <br />
                        <input type="checkbox" class="form-check-input" id="admincr" value="true" />
                        <label class="form-check-label" for="admincr">Administrateur</label>
                        <br />
                        <button type="button" class="btn btn-primary" onClick={this.creeCompte}>Confirmer</button>
                    </form>
                </div>
            </div>
        </div>
    }

    //Permet de logout par le bouton
    logout() {
        let instanceGrille = this
        this.resetComplet(function () {
            instanceGrille.setOffline()
        })
    }

    //Reset le jeu et l'utilisateur
    resetComplet(handleData) {
        this.setState({
            nbDeplacements: 0,
            valCases: Array(this.props.n).fill(0).map(() => new Array(this.props.n).fill(0)),
            caseFus: Array(this.props.n).fill(false).map(() => new Array(this.props.n).fill(false)),
            page: 0,
            idCompte: -1,
            nomcompte: '',
            scoreMax: 0,
            scoreMaxTotal: 0,
            admin: false
        })
        handleData()
    }

    //Fonction du bouton pour aller au panneau administration
    boutonAdmin() {
        this.setState({ page: 2 })
        const instanceGrille = this;
        this.infosAdmin(function (data) {
            instanceGrille.panneauAdmin(data, function () { })
        })
        this.setState({ page: 2 })
    }

    //Met l'affichage du jeu
    jeu() {
        const textPerdu = this.checkPerdu() ? <h1 class="text-center">Vous avez perdu</h1> : <div></div>
        const textGagne = this.checkGagne() ? <h1 class="text-center">Vous avez gagné</h1> : <div></div>
        const btnAdmin = this.state.admin ? <div class="d-grid col-2 mx-auto"><button class="btn btn-primary" onClick={this.boutonAdmin}>Panneau Administrateur</button></div> : <div></div>
        return <div>
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col border text-center fw-bold">Compte: {this.state.nomcompte}</div>
                    <div class="col border text-center fw-bold">Meilleur score: {this.state.scoreMax}</div>
                    <div class="col border text-center fw-bold">Meilleur au monde: {this.state.scoreMaxTotal}</div>
                </div>
            </div>
            <div class="d-grid col-1 mx-auto">
                <button class="btn btn-primary" onClick={this.logout}>Log out</button>
            </div>
            <h1 class="text-center">Score: {this.state.nbDeplacements}</h1>
            <div class="container jeu2048">
                {this.state.valCases.map((row, i) => {
                    return (<div class="row row2048">{row.map((nb, j) => { return (<Case valeur={nb} />) })}</div>)
                })}
            </div>
            {textPerdu}
            {textGagne}
            <h4 class="text-center">Appuyez sur R pour recommencer</h4>
            {btnAdmin}
        </div>
    }

    //Met l'affichage du paneau administration
    panneauAdmin(data, handleData) {
        let nbOnline = 0
        data.forEach(compte => {
            if (compte.online) {
                nbOnline++
            }
        });
        affichageFinal = <div>
            <div class="container mt-2 mb-2">
                <div class="row">
                    <div class="col border fw-bold">
                        Nombres de joueurs en ligne: {nbOnline}
                    </div>
                    <div class="col border fw-bold">
                        Nombres de joueurs total: {data.length}
                    </div>
                </div>
            </div>
            <table id="table">
                <thead>
                    <tr>
                        <th data-field="id">ID</th>
                        <th data-field="nomcompte">Login</th>
                        <th data-field="scoreMax" data-sortable="true">Meilleur score</th>
                        <th data-field="admin">Administrateur</th>
                        <th data-field="dateInscription" data-sortable="true">Date d'inscription</th>
                        <th data-field="online">Online</th>
                    </tr>
                </thead>
            </table>
        </div>
        $('#table').bootstrapTable({ data: data })
        handleData()
    }

    //Va chercher les infos affiché dans le panneau administration
    infosAdmin(handleData) {
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: urlJSON + "admin",
            success: function (data) {
                handleData(data)
            }
        })
    }

    //Permet de créer un compte
    creeCompte() {
        let instanceGrille = this
        $.ajax({
            data: {
                'logincr': $('#logincr').val(),
                'mdpcr': $('#mdpcr').val(),
                'admincr': String(document.getElementById("admincr").checked)
            },
            type: 'POST',
            url: urlJSON + "creation",
            success: function (data) {
                console.log("fait", data)
            }
        })
            .done(function (datacreation) {
                if(datacreation){
                    $.ajax({
                        data: {
                            'loginco': $('#logincr').val(),
                            'mdpco': $('#mdpcr').val()
                        },
                        type: 'POST',
                        url: urlJSON + "login",
                        success: function (data) {
                            if (data.id != -1) {
                                console.log("fait", data)
                            }
                            else {
                                console.log("informations incorrectes")
                            }
                            instanceGrille.setJeu(data)
    
                        }
                    })
                }
                else{
                    alert("Un login identique est déjà existant")
                }
                
            })
    }

    //Fonction du bouton login
    btnLogin() {
        const instanceGrille = this
        this.loginCompte(function (infos) {
            if (infos.id > -1) {
                instanceGrille.setJeu(infos)
                instanceGrille.setOnline()
            }
        })
    }

    //Met l'utilisateur actif online sur la base de donnée
    setOnline(){
        const instanceGrille = this
        $.ajax({
            data: JSON.stringify({
                'id': instanceGrille.state.idCompte
            }),
            type: 'POST',
            url: urlJSON + "setonline",
            dataType: "json",
            contentType: "application/json"
        })
    }

    //Met l'utilisateur actif offline sur la base de donnée
    setOffline(){
        const instanceGrille = this
        $.ajax({
            data: JSON.stringify({
                'id': instanceGrille.state.idCompte
            }),
            type: 'POST',
            url: urlJSON + "setoffline",
            dataType: "json",
            contentType: "application/json"
        })
    }

    //Appel le serveur pour faire une connection
    loginCompte(handleData) {
        $.ajax({
            data: {
                'loginco': $('#loginco').val(),
                'mdpco': $('#mdpco').val()
            },
            type: 'POST',
            url: urlJSON + "login",
            success: function (data) {
                if (data == false) {
                    alert("Informations de connection incorrectes")
                }
                handleData(data)
            }
        })
    }

    //Met les states du jeu
    setJeu(infos) {
        let admin
        if (infos.admin == 0) {
            admin = false
        }
        else {
            admin = true
        }
        this.setState({
            page: 1,
            idCompte: infos.id,
            nomcompte: infos.nomcompte,
            scoreMax: infos.scoreMax,
            admin: admin
        })
        this.getMeilleurMonde()
    }

    //Va chercher le meilleur joueur au monde
    getMeilleurMonde() {
        const instanceGrille = this
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: urlJSON + "admin",
            success: function (data) {
                let score = null
                data.forEach(compte => {
                    if (compte.scoreMax != null) {
                        if (score == null) {
                            score = compte.scoreMax
                        }
                        else if (compte.scoreMax < score) {
                            score = compte.scoreMax
                        }
                    }
                });
                instanceGrille.setState({ scoreMaxTotal: score })
            }
        })
    }

    //Met le nouveau score de l'utilisateur actif dans la base de donnée si c'est son meilleur
    setNewScore() {
        const instanceGrille = this
        if (this.state.scoreMax == null || this.state.scoreMax > this.state.nbDeplacements) {
            $.ajax({
                data: JSON.stringify({
                    'id': instanceGrille.state.idCompte,
                    'score': instanceGrille.state.nbDeplacements
                }),
                type: 'POST',
                url: urlJSON + "score",
                dataType: "json",
                contentType: "application/json",
                success: function (score) {
                    console.log("score", instanceGrille.state.nbDeplacements)
                    instanceGrille.setState({ scoreMax: score })
                    instanceGrille.getMeilleurMonde()
                }
            })
        }
    }

    //Permet d'update le meilleur joueur au monde à chaque seconde
    componentDidMount() {
        this.interval = setInterval(() => this.getMeilleurMonde(), 1000);
        
    }

    //Évite les memory leak lorsqu'on a plus besoin du timer de meilleur au monde
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.state.page == 0) {
            affichageFinal = this.login()
        }
        else if (this.state.page == 1) {
            affichageFinal = this.jeu()
        }
        else if (this.state.page == 2) {
            const instanceGrille = this;
            this.infosAdmin(function (data) {
                instanceGrille.panneauAdmin(data, function () { })
            })
        }
        else {
            affichageFinal = this.jeu()
        }
        return (
            affichageFinal
        )
    }
}
