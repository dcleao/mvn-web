class Foo {
  constructor() {
    var bar = "";
    if (bar == null) {
      return;
    }
  }

  doAsync() {
    return new Promise();
  }
}

export default Foo;
