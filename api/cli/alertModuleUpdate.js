// CLI helper to send model update alerts via Node API
import minimist from 'minimist';
import alertAgent from '../../alerts/alertAgent.js';
const { alertModelUpdate } = alertAgent;

const args = minimist(process.argv.slice(2));
const version = args.version || args.v;
const accuracy = parseFloat(args.accuracy || args.a);

if (!version || Number.isNaN(accuracy)) {
  console.error('Usage: node alertModelUpdate.js --version <hash> --accuracy <val>');
  process.exit(1);
}

alertModelUpdate(version, accuracy).catch(err => {
  console.error(err);
  process.exit(1);
});
