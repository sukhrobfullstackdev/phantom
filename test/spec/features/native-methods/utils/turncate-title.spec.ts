import { truncateTitle } from '~/features/native-methods/utils/truncate-title';

describe('Test truncateTitle function', () => {
  test('When the truncateTitle function receives a title that is over 56 characters, it should be truncated.', async () => {
    const lessThan56 = 'A title is less than 56 characters.';
    expect(truncateTitle(lessThan56)).toEqual(lessThan56);

    const equalTo56 = 'A title is equal to 56 characters. A title is equal to 5';
    expect(truncateTitle(equalTo56)).toEqual(equalTo56);

    const over56 = 'A title is over 56 characters. A title is over 56 characters. A title is over 56 characters.';
    expect(truncateTitle(over56)).toEqual('A title is over 56 characters. A title is over 56 charac...');
  });
});
