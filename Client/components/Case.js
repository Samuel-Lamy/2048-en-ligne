class Case extends React.Component {
    constructor(props) {
        super(props)
    }

    couleur() {
        switch (this.props.valeur) {
            case 0:
                return <div class="col text-center align-middle g-0 case2048 coul-0"></div>
            case 2:
                return <div class="col text-center align-middle g-0 case2048 coul-2">{this.props.valeur}</div>
            case 4:
                return <div class="col text-center align-middle g-0 case2048 coul-4">{this.props.valeur}</div>
            case 8:
                return <div class="col text-center align-middle g-0 case2048 coul-8">{this.props.valeur}</div>
            case 16:
                return <div class="col text-center align-middle g-0 case2048 coul-16">{this.props.valeur}</div>
            case 32:
                return <div class="col text-center align-middle g-0 case2048 coul-32">{this.props.valeur}</div>
            case 64:
                return <div class="col text-center align-middle g-0 case2048 coul-64">{this.props.valeur}</div>
            case 128:
                return <div class="col text-center align-middle g-0 case2048 coul-128">{this.props.valeur}</div>
            case 256:
                return <div class="col text-center align-middle g-0 case2048 coul-256">{this.props.valeur}</div>
            case 512:
                return <div class="col text-center align-middle g-0 case2048 coul-512">{this.props.valeur}</div>
            case 1024:
                return <div class="col text-center align-middle g-0 case2048 coul-1024">{this.props.valeur}</div>
            case 2048:
                return <div class="col text-center align-middle g-0 case2048 coul-2048">{this.props.valeur}</div>
            default:
                <div class="col text-center align-middle g-0 case2048">{this.props.valeur}</div>
        }
    }

    render() {
        return (
            this.couleur()
        )
    }
}
