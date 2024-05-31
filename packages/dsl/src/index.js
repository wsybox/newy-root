let render = function (...children) {
  return this.render(Object.assign(children.length ? { children } : {}, this.data))
}

let isTemp = args =>
  Array.isArray(args[0]) &&
  args[0].every(s => typeof s === 'string') &&
  args[0].hasOwnProperty('raw') &&
  args.length === args[0].length

let puppet = {}

export class Neway extends Function {
  constructor(data, call, conf) {
    super()
    this.data = data
    this._call = call
    if (conf) this.conf = conf
    return new Proxy(this, {
      apply: (target, _, args) => target._call.apply(target, args)
    })
  }
  render(data) {
    data.children && (data.children = data.children.map(ch => (ch instanceof Neway ? ch() : ch)))
    return data
  }
}

export const init = (photo = Neway) => {
  let handle = conf => ({
    get: (_, name) =>
      new photo(
        { name },
        function (...args) {
          if (isTemp(args)) {
            let [strs, ...vals] = args
            return new photo({ strs, vals, name }, render, conf)
          }

          return render.apply(this, args)
        },
        conf
      )
  })

  return new Proxy(conf => new Proxy(puppet, handle(conf)), handle())
}
