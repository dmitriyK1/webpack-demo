export default (text = 'Hello world') => {
  const element = document.createElement('div');
  element.innerHTML = text;
  element.className = 'pure-button';

  return element;
};
