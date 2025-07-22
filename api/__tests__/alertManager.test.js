import { jest } from '@jest/globals';

jest.mock('../alerts/emailAlert.js', () => ({
  sendEmail: jest.fn(() => {
    throw new Error('fail');
  })
}));

import { sendAlert } from '../alerts/alertAgent.js';

describe('sendAlert error handling', () => {
  beforeEach(() => {
    process.env.SMTP_USER = 'u';
    process.env.SMTP_PASS = 'p';
    process.env.ALERT_RECIPIENT = 'r';
  });

  test('email failures are propagated', async () => {
    await expect(sendAlert('email', 'msg')).rejects.toThrow('fail');
  });
});
