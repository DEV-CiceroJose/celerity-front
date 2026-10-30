import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, details) {
    console.error('Falha inesperada na interface', error, details)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <main className="fatal-error"><span>!</span><p className="eyebrow">Não foi possível continuar</p><h1>Algo não saiu como esperado.</h1><p>Seus dados locais continuam seguros. Recarregue a página para tentar novamente.</p><button type="button" onClick={() => window.location.reload()}>Recarregar sistema</button><a href="mailto:suporte@celerityambiental.com.br">Falar com o suporte</a></main>
  }
}
