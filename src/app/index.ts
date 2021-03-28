import { Application } from './app';

console.log('Process arguments:', process.argv);
const app = new Application({ clientPath: process.argv[3] });
app.start();
