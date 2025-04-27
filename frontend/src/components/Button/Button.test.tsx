import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button component', () => {
  it('renderiza o texto corretamente', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('dispara a função onClick quando clicado', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clique aqui</Button>)

    const button = screen.getByText('Clique aqui')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('aplica o estilo correto para o variant "light"', () => {
    render(<Button variant="light">Botão Claro</Button>)
    const button = screen.getByText('Botão Claro')
    expect(button.className).toContain('button')
    expect(button.className).toContain('light')
  })

  it('aplica o estilo correto para o variant "dark"', () => {
    render(<Button variant="dark">Botão Escuro</Button>)
    const button = screen.getByText('Botão Escuro')
    expect(button.className).toContain('button')
    expect(button.className).toContain('dark')
  })

  it('fica desabilitado quando a prop disabled é true', () => {
    render(<Button disabled>Desabilitado</Button>)
    const button = screen.getByText('Desabilitado') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
