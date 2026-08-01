const SESSION_KEY = 'celerity_session'
const ACCOUNTS_KEY = 'celerity_accounts'

const demoAccount = {
  name: 'Mariana Costa',
  email: 'demo@celerityambiental.com.br',
  role: 'Gestora',
  company: 'Celerity Ambiental',
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function getAccounts() {
  return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
}

export const authService = {
  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  },
  async login({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const normalizedEmail = email.trim().toLowerCase()
    const isDemo = normalizedEmail === demoAccount.email && password === 'Celerity@2026'
    const account = isDemo ? demoAccount : getAccounts().find((item) => item.email.toLowerCase() === normalizedEmail)
    const passwordMatches = isDemo || (account && (account.passwordHash || await hashPassword(account.password || '')) === await hashPassword(password))
    if (!account || !passwordMatches) throw new Error('E-mail ou senha incorretos.')
    const session = { name: account.name, email: account.email, role: account.role, company: account.company }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },
  async register(data) {
    await new Promise((resolve) => setTimeout(resolve, 550))
    const accounts = getAccounts()
    if ([demoAccount, ...accounts].some((item) => item.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error('Já existe um acesso cadastrado com este e-mail.')
    }
    const { password, ...accountData } = data
    accounts.push({ ...accountData, email: data.email.trim().toLowerCase(), passwordHash: await hashPassword(password) })
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    return true
  },
  logout() {
    localStorage.removeItem(SESSION_KEY)
  },
}
