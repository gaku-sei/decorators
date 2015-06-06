import * as _ from 'lodash';

let abstract = (target) => {
  target.isAbstract = true;
};

let curry = (target, name, descriptor) => {
  descriptor.value = _.curry(descriptor.value);
};

let memoize = (target, name, descriptor) => {
  descriptor.value = _.memoize(descriptor.value);
};

let warn = (message = 'Warning') => {
  return (target, name, descriptor) => {
    let value = descriptor.value;
    descriptor.value = function(...args) {
      console.warn(`${name}: ${message}`);
      return value.apply(this, args);
    };
  };
};

let override = (target, name, descriptor) => {
  let value = descriptor.value;
  descriptor.value = function(...args1) {
    descriptor.value.old = (...args2) =>
      Object.getPrototypeOf(Object.getPrototypeOf(this))[name].apply(this, args2);
    return value.apply(this, args1);
  };
};

let meta = (obj) => {
  return (target, name, descriptor) => {
    descriptor.value.meta = obj;
  };
};

let params = (...args) => {
  return (target, name, descriptor) => {
    descriptor.value.doc = descriptor.value.doc || [];
    descriptor.value.doc.unshift(['params', ...args]);
  };
};

let returns = (...args) => {
  return (target, name, descriptor) => {
    descriptor.value.doc = descriptor.value.doc || [];
    descriptor.value.doc.unshift(['returns', ...args]);
  };
};

@abstract
class Test1 {
  constructor() {
    this.x = 42;
  }

  @warn('Beware!')
  foo() {
    console.log(this.x);
  }

  @curry
  bar(x, y, z) {
    console.log(x + y + z);
  }

  @memoize
  baz(x, y, z) {
    console.log(x + y + z);
  }

  @meta({foo: 42});
  test(str, x) {
    return 'oof!';
  }
}

class Test2 extends Test1 {
  constructor() {
    super();
  }

  @override
  foo() {
    console.log(this.x * 2);
  }
}

let t1 = new Test1();
t1.foo();
t1.bar(1, 2)(3);
t1.baz(1, 2, 3);
console.log(t1.test());
console.log(t1.test.meta);
let t2 = new Test2();
t2.foo();
t2.foo.old();
