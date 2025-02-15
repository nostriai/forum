import {
  initializeNDK,
  generateKeyPair,
  createAndSignEvent,
  publishEvent,
  subscribeToEvents,
  getNostrData,
} from '../src/services/nostrService';

jest.mock('ndk', () => {
  class MockNDK {
    constructor(config) {
      this.config = config;
    }
    async connect() {
      if (MockNDK.shouldFailConnect) {
        throw new Error('Connection failed');
      }
      return;
    }
    generateKeyPair() {
      return { publicKey: 'mockPublicKey', privateKey: 'mockPrivateKey' };
    }
    async signEvent(eventData) {
      if (MockNDK.shouldFailSign) {
        throw new Error('Signing failed');
      }
      return { ...eventData, signed: true };
    }
    async publish(event) {
      if (MockNDK.shouldFailPublish) {
        throw new Error('Publishing failed');
      }
      return { success: true };
    }
    subscribe(filter, callback) {
      const sub = {
        filter,
        callback,
        unsubscribe: jest.fn(),
        events: [],
      };

      // Simulate receiving events
      if (filter.simulateEvents) {
        setTimeout(() => {
          callback({ id: '1', content: 'test event' });
        }, 0);
      }

      return sub;
    }
  }

  // Static flags for controlling mock behavior
  MockNDK.shouldFailConnect = false;
  MockNDK.shouldFailSign = false;
  MockNDK.shouldFailPublish = false;

  return { NDK: MockNDK };
});

describe('nostrService', () => {
  let NDK;

  beforeEach(() => {
    // Reset mock behavior flags
    NDK = jest.requireMock('ndk').NDK;
    NDK.shouldFailConnect = false;
    NDK.shouldFailSign = false;
    NDK.shouldFailPublish = false;
  });

  describe('initializeNDK', () => {
    test('returns true on successful connection', async () => {
      const result = await initializeNDK();
      expect(result).toBe(true);
    });

    test('throws error on connection failure', async () => {
      NDK.shouldFailConnect = true;
      await expect(initializeNDK()).rejects.toThrow('Connection failed');
    });
  });

  describe('generateKeyPair', () => {
    test('returns a valid key pair', async () => {
      const keyPair = await generateKeyPair();
      expect(keyPair).toHaveProperty('publicKey', 'mockPublicKey');
      expect(keyPair).toHaveProperty('privateKey', 'mockPrivateKey');
    });
  });

  describe('createAndSignEvent', () => {
    test('signs the event data successfully', async () => {
      const eventData = { content: 'test event' };
      const signedEvent = await createAndSignEvent(eventData);
      expect(signedEvent).toMatchObject({
        content: 'test event',
        signed: true,
      });
    });

    test('throws error when signing fails', async () => {
      NDK.shouldFailSign = true;
      const eventData = { content: 'test event' };
      await expect(createAndSignEvent(eventData)).rejects.toThrow(
        'Signing failed'
      );
    });
  });

  describe('publishEvent', () => {
    test('publishes event successfully', async () => {
      const event = { content: 'publish event' };
      const result = await publishEvent(event);
      expect(result).toMatchObject({ success: true });
    });

    test('throws error when publishing fails', async () => {
      NDK.shouldFailPublish = true;
      const event = { content: 'publish event' };
      await expect(publishEvent(event)).rejects.toThrow('Publishing failed');
    });
  });

  describe('subscribeToEvents', () => {
    test('returns a subscription object with unsubscribe function', () => {
      const filter = { kind: 1 };
      const callback = jest.fn();
      const sub = subscribeToEvents(filter, callback);
      expect(sub).toHaveProperty('filter', filter);
      expect(typeof sub.unsubscribe).toBe('function');
    });

    test('callback is called when events are received', (done) => {
      const filter = { kind: 1, simulateEvents: true };
      const callback = jest.fn((event) => {
        expect(event).toMatchObject({ id: '1', content: 'test event' });
        done();
      });

      subscribeToEvents(filter, callback);
    });
  });

  describe('getNostrData', () => {
    test('returns sample data with correct format', async () => {
      const data = await getNostrData();
      expect(data).toHaveProperty('message', 'NDK integrated event data');
      expect(data).toHaveProperty('timestamp');
      expect(Date.parse(data.timestamp)).not.toBeNaN();
    });
  });
});
