goog.require('utils');

describe('airbridge utils', function() {
    it('해당 color의 lightness를 반환합니다.', function() {
        var color = "#ff3333";
        var hsl = utils.hexToHsl(color);
        expect(hsl).to.be.ok;
        expect(hsl[2]).to.be.equal(0.6);
    });
});
