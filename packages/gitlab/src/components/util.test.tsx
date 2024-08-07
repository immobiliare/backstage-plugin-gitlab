import { convertWildcardFilterArrayToFilterFunction } from './utils';

describe('convertWildcardFilterArrayToFilterFunction', () => {
    it('should return true if input matches any of the validInputs', () => {
        const input = 'foobar';
        const validInputs = ['foo*', 'bar', 'baz'];
        const result = convertWildcardFilterArrayToFilterFunction(
            input,
            validInputs
        );
        expect(result).toBeTruthy();
    });

    it('should return false if input does not match any of the validInputs', () => {
        const input = 'foobar';
        const validInputs = ['baz', 'qux'];
        const result = convertWildcardFilterArrayToFilterFunction(
            input,
            validInputs
        );
        expect(result).toBeFalsy();
    });

    it('should account for multiple wildcards in the validInputs', () => {
        const input = 'foobar';
        const validInputs = ['foo*', '*bar', 'baz'];
        const result = convertWildcardFilterArrayToFilterFunction(
            input,
            validInputs
        );
        expect(result).toBeTruthy();
    });

    it('should always return true if any of the valid inputs is *', () => {
        const input = 'foobar';
        const validInputs = ['*'];
        const result = convertWildcardFilterArrayToFilterFunction(
            input,
            validInputs
        );
        expect(result).toBeTruthy();
    });

    it('should account for ** in the validInputs', () => {
        const input = 'foobar';
        const validInputs = ['foo**', 'bar', 'baz'];
        const result = convertWildcardFilterArrayToFilterFunction(
            input,
            validInputs
        );
        expect(result).toBeTruthy();
    });
});
