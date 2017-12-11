export default (text = 'Hello world') => {
  const element = document.createElement('div');
  element.innerHTML = text;
  // element.className = 'pure-button';
  element.className = 'fa fa-hand-spock-o fa-1g';

  element.onclick = () => {
    import(/* webpackChunkName: "myLazyChunk" */ './lazy')
      .then((module) => {
        element.textContent = module.default;
      }).catch((err) => {
        console.error(err); // eslint-disable-line
      });

    // Will be included in the same bundle
    import(/* webpackChunkName: "myLazyChunk" */ './test');
  };

  // element.onclick = () => {
  //   require.ensure([], (require) => {
  //     element.textContent = require('./lazy').default;
  //   });
  // };

  return element;
};
