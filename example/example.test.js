const subtract = require('./example');

describe('subtract', () => {
  context('when A is bigger than B', () => {
    it('should return positive number', () => {
      expect(subtract(2, 1)).to.equal(1);
    });
  });

  context('when A is equal to B', () => {
    it('should return 0', () => {
      expect(subtract(2, 2)).to.equal(0);
    });
  });

  context('when A is less than B', () => {
    it('should return negative number', () => {
      expect(subtract(1, 2)).to.equal(-1);
    });
  });
});
