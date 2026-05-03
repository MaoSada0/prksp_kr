import { render, screen } from '@testing-library/react'
import Avatar from '../components/Avatar'

describe('Avatar', () => {
  it('renders initials from full name', () => {
    render(<Avatar name="Ivan Petrov" />)
    expect(screen.getByText('IP')).toBeInTheDocument()
  })

  it('renders single initial for one-word name', () => {
    render(<Avatar name="Ivan" />)
    expect(screen.getByText('I')).toBeInTheDocument()
  })

  it('renders ? for empty name', () => {
    render(<Avatar name="" />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders img when src is provided', () => {
    render(<Avatar name="Ivan Petrov" src="https://example.com/photo.jpg" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    expect(img).toHaveAttribute('alt', 'Ivan Petrov')
  })

  it('does not render img when src is null', () => {
    render(<Avatar name="Ivan Petrov" src={null} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('applies sm size class', () => {
    const { container } = render(<Avatar name="AB" size="sm" />)
    expect(container.firstChild).toHaveClass('w-8')
  })

  it('applies xl size class', () => {
    const { container } = render(<Avatar name="AB" size="xl" />)
    expect(container.firstChild).toHaveClass('w-16')
  })

  it('two different names get different background colors', () => {
    const { container: c1 } = render(<Avatar name="Anna Ivanova" />)
    const { container: c2 } = render(<Avatar name="Boris Petrov" />)
    const bg1 = c1.firstChild.style.backgroundColor
    const bg2 = c2.firstChild.style.backgroundColor
    expect(bg1).not.toBe(bg2)
  })

  it('img has rounded-full class', () => {
    render(<Avatar name="Test" src="http://example.com/img.jpg" />)
    expect(screen.getByRole('img')).toHaveClass('rounded-full')
  })
})
