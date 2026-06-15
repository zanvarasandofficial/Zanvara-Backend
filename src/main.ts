import { createLocalServer } from './bootstrap';

async function bootstrap() {
  const app = await createLocalServer();
  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port, '0.0.0.0');

  console.log(`Zanvara API running at http://localhost:${port}/api`);
  console.log('Server is running. Keep this terminal open (Ctrl+C to stop).');
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

bootstrap().catch((error: Error) => {
  if (error.message.includes('EADDRINUSE') || error.message.includes('already in use')) {
    console.error(
      `Port ${process.env.PORT ?? 4000} is already in use. Close the other backend terminal first.`,
    );
  } else {
    console.error(error.message || error);
  }
  process.exit(1);
});
