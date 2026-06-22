import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import Avatar from '../../components/Avatar'

describe('Avatar — property-based фаззинг', () => {
  afterEach(cleanup)

  /**
   * Любая Unicode-строка (включая emoji, CJK, суррогатные пары)
   * должна рендериться без исключений.
   */
  it('[F-AV-01] рендер с любой Unicode-строкой не вызывает исключения', () => {
    fc.assert(
      fc.property(fc.unicodeString(), (name) => {
        const { unmount } = render(<Avatar name={name} />)
        unmount()
      }),
      { numRuns: 300 }
    )
  })

  /**
   * pickColor(name) использует name.charCodeAt(i) % 6 — результат всегда
   * в пределах массива colors[0..5]. backgroundColor никогда не должен быть пустым.
   */
  it('[F-AV-02] backgroundColor всегда определён для любой строки', () => {
    fc.assert(
      fc.property(fc.unicodeString(), (name) => {
        const { container, unmount } = render(<Avatar name={name} />)
        const div = container.querySelector('div')
        if (div) {
          expect(div.style.backgroundColor).toBeTruthy()
        }
        unmount()
      }),
      { numRuns: 300 }
    )
  })

  /**
   * pickColor детерминирован: одно и то же имя всегда даёт
   * одинаковый цвет фона — важно для UX-консистентности.
   */
  it('[F-AV-03] одинаковое имя всегда даёт одинаковый backgroundColor', () => {
    fc.assert(
      fc.property(fc.unicodeString(), (name) => {
        const { container: c1, unmount: u1 } = render(<Avatar name={name} />)
        const bg1 = c1.querySelector('div')?.style?.backgroundColor
        u1()

        const { container: c2, unmount: u2 } = render(<Avatar name={name} />)
        const bg2 = c2.querySelector('div')?.style?.backgroundColor
        u2()

        expect(bg1).toBe(bg2)
      }),
      { numRuns: 200 }
    )
  })

  /**
   * При любом src-URL компонент рендерит <img> с корректным alt,
   * равным переданному name.
   */
  it('[F-AV-04] src-строка всегда рендерит <img> с корректным alt', () => {
    fc.assert(
      fc.property(fc.unicodeString(), fc.webUrl(), (name, src) => {
        const { container, unmount } = render(<Avatar name={name} src={src} />)
        const img = container.querySelector('img')
        expect(img).not.toBeNull()
        expect(img.getAttribute('alt')).toBe(name)
        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * НАХОДКА [BUG-AV-01]: Avatar падает с TypeError при name={null}.
   * Дефолтное значение name='' применяется только для undefined,
   * но не для null. Исправление: заменить `name = ''` на `name = null`
   * с явной проверкой `const safeName = name ?? ''` внутри компонента.
   */
  it('[BUG-AV-01] name={null} вызывает TypeError — null не перехватывается дефолтом', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Avatar name={null} />)).toThrow(TypeError)
    spy.mockRestore()
  })
})
