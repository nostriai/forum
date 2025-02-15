import {
  initializeNDK,
  generateKeyPair,
  createAndSignEvent,
  publishEvent,
  subscribeToEvents,
  getNostrData
} from '../src/services/nostrService';

jest.mock('ndk', () => {
  class MockNDK {
    constructor(config) {
      this.config = config;
    }
    async connect() {
      return;
    }
    generateKeyPair() {
      return { publicKey: 'mockPublicKey', privateKey: 'mockPrivateKey' };
    }
    async signEvent(eventData) {
      return { ...eventData, signed: true };
    }
    async publish(event) {
      return { success: true };
    }
    subscribe(filter, callback) {
      return { filter, callback, unsubscribe: jest.fn() };
    }
  }
  return { NDK: MockNDK };
});

describe('nostrService', () => {
  test('initializeNDK returns true on successful connection', async () => {
    const result = await initializeNDK();
    expect(result).toBe(true);
  });

  test('generateKeyPair returns a valid key pair', async () => {
    const keyPair = await generateKeyPair();
    expect(keyPair).toHaveProperty('publicKey');
    expect(keyPair).toHaveProperty('privateKey');
  });

  test('createAndSignEvent signs the event data', async () => {
    const eventData = { content: 'test event' };
    const signedEvent = await createAndSignEvent(eventData);
    expect(signedEvent).toMatchObject({ content: 'test event', signed: true });
  });

  test('publishEvent returns success', async () => {
    const event = { content: 'publish event' };
    const result = await publishEvent(event);
    expect(result).toMatchObject({ success: true });
  });

  test('subscribeToEvents returns a subscription object', () => {
    const filter = { kind: 1 };
    const callback = jest.fn();
    const sub = subscribeToEvents(filter, callback);
    expect(sub).toHaveProperty('filter', filter);
    expect(typeof sub.unsubscribe).toBe('function');
  });

  test('getNostrData returns sample data', async () => {
    const data = await getNostrData();
    expect(data).toHaveProperty('message', 'NDK integrated event data');
    expect(data).toHaveProperty('timestamp');
  });
});
